import "server-only";
import { voteCampaign, type VoteStore } from "./voting.ts";
export function createVoteStore(): { store: VoteStore; secret: string } | null {
  const url = process.env.WL_COMMUNITY_SUPABASE_URL;
  const secret = process.env.WL_COMMUNITY_SUPABASE_SECRET_KEY;
  if (!url || !secret) return null;
  async function rpc(name: string, args: Record<string, unknown> = {}) {
    const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
      method: "POST",
      headers: { apikey: secret!, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw Error("Voting storage unavailable");
    return response.json();
  }
  return {
    secret,
    store: {
      async counts() {
        const rows = await rpc("wl_topic_vote_counts", {
          p_campaign: voteCampaign,
        });
        return Object.fromEntries(
          rows.map((r: { topic_id: string; votes: number }) => [
            r.topic_id,
            Number(r.votes),
          ]),
        );
      },
      async hasVote(hash) {
        return (
          (await rpc("wl_topic_voted", {
            p_campaign: voteCampaign,
            p_voter: hash,
          })) === true
        );
      },
      async vote(topic, hash, bucket) {
        const result = await rpc("wl_cast_topic_vote", {
          p_campaign: voteCampaign,
          p_topic: topic,
          p_voter: hash,
          p_bucket: bucket,
        });
        if (!["saved", "duplicate", "limited"].includes(result))
          throw Error("Invalid receipt");
        return result;
      },
    },
  };
}
