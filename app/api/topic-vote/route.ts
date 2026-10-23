import { createVoteHandlers } from "@/lib/learning/voting";
import { createVoteStore } from "@/lib/learning/vote-storage";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
function unavailable() {
  return Response.json(
    {
      ok: false,
      message: "Voting is temporarily unavailable. Please try again later.",
    },
    { status: 503, headers: { "Cache-Control": "no-store" } },
  );
}
export async function GET(request: Request) {
  const config = createVoteStore();
  return config
    ? createVoteHandlers(config.store, config.secret).GET(request)
    : unavailable();
}
export async function POST(request: Request) {
  const config = createVoteStore();
  return config
    ? createVoteHandlers(config.store, config.secret).POST(request)
    : unavailable();
}
