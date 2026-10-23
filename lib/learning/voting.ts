import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { voteTopics } from "./content.ts";
export const voteCookie = "wl_reader_vote";
export const voteCampaign = "learning-2026-10";
export const allowedTopics = new Set<string>(voteTopics.map((t) => t.id));
const maxAge = 180 * 24 * 60 * 60;
export function signVoter(secret: string, now = Date.now()) {
  const value = `${randomUUID()}.${Math.floor(now / 1000)}`;
  return `${value}.${createHmac("sha256", secret).update(value).digest("hex")}`;
}
export function validVoter(value: string, secret: string, now = Date.now()) {
  const parts = value.split(".");
  if (
    parts.length !== 3 ||
    !/^[\da-f-]{36}$/.test(parts[0]) ||
    !/^\d{10}$/.test(parts[1]) ||
    !/^[\da-f]{64}$/.test(parts[2])
  )
    return false;
  const age = Math.floor(now / 1000) - Number(parts[1]);
  if (age < 0 || age > maxAge) return false;
  const expected = createHmac("sha256", secret)
    .update(`${parts[0]}.${parts[1]}`)
    .digest("hex");
  return timingSafeEqual(Buffer.from(expected), Buffer.from(parts[2]));
}
export function voterHash(value: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`voter:${voteCampaign}:${value}`)
    .digest("hex");
}
export function networkBucket(
  address: string,
  secret: string,
  now = Date.now(),
) {
  return createHmac("sha256", secret)
    .update(`rate:${new Date(now).toISOString().slice(0, 10)}:${address}`)
    .digest("hex");
}
export function requestOriginAllowed(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const allowed = [
    "https://weightliteracy.org",
    "https://www.weightliteracy.org",
  ];
  if (
    process.env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1"].includes(url.hostname)
  )
    allowed.push(url.origin);
  return !!origin && allowed.includes(origin);
}
export function readVoter(request: Request) {
  return (
    request.headers
      .get("cookie")
      ?.split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith(`${voteCookie}=`))
      ?.slice(voteCookie.length + 1) || ""
  );
}
export function voterCookie(value: string, secure: boolean) {
  return `${voteCookie}=${value}; HttpOnly; SameSite=Lax; Path=/api/topic-vote; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}
export interface VoteStore {
  counts(): Promise<Record<string, number>>;
  hasVote(hash: string): Promise<boolean>;
  vote(
    topic: string,
    hash: string,
    bucket: string,
  ): Promise<"saved" | "duplicate" | "limited">;
}
export function createVoteHandlers(store: VoteStore, secret: string) {
  const headers = { "Cache-Control": "no-store" };
  return {
    async GET(request: Request) {
      try {
        const old = readVoter(request);
        const token = validVoter(old, secret) ? old : signVoter(secret);
        const [counts, voted] = await Promise.all([
          store.counts(),
          store.hasVote(voterHash(token, secret)),
        ]);
        return Response.json(
          { ok: true, counts, voted },
          {
            headers: {
              ...headers,
              "Set-Cookie": voterCookie(
                token,
                new URL(request.url).protocol === "https:",
              ),
            },
          },
        );
      } catch {
        return Response.json(
          {
            ok: false,
            message:
              "Voting is temporarily unavailable. Please try again later.",
          },
          { status: 503, headers },
        );
      }
    },
    async POST(request: Request) {
      if (!requestOriginAllowed(request))
        return Response.json(
          { ok: false, message: "This request could not be accepted." },
          { status: 403, headers },
        );
      const token = readVoter(request);
      if (!validVoter(token, secret))
        return Response.json(
          { ok: false, message: "Please reload this page before voting." },
          { status: 400, headers },
        );
      if (!request.headers.get("content-type")?.startsWith("application/json"))
        return Response.json({ ok: false }, { status: 415, headers });
      let topic: string;
      try {
        const body = await request.text();
        if (body.length > 512) throw Error();
        const payload = JSON.parse(body);
        if (
          Object.keys(payload).length !== 1 ||
          !allowedTopics.has(payload.topic)
        )
          throw Error();
        topic = payload.topic;
      } catch {
        return Response.json(
          { ok: false, message: "Choose one of the listed topics." },
          { status: 400, headers },
        );
      }
      try {
        const address =
          request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ||
          request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
          "unknown";
        const result = await store.vote(
          topic,
          voterHash(token, secret),
          networkBucket(address, secret),
        );
        if (result === "limited")
          return Response.json(
            {
              ok: false,
              message: "Too many requests. Please try again tomorrow.",
            },
            { status: 429, headers },
          );
        return Response.json(
          {
            ok: true,
            voted: true,
            message:
              result === "duplicate"
                ? "Your vote has already been saved."
                : "Thank you. Your vote has been saved.",
            counts: await store.counts(),
          },
          { headers },
        );
      } catch {
        return Response.json(
          {
            ok: false,
            message: "Your vote could not be saved. Please try again later.",
          },
          { status: 503, headers },
        );
      }
    },
  };
}
