import { ToolShell } from "@/components/learning/tool-shell";
import { TopicVote } from "@/components/learning/topic-vote";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Help choose our next explainer",
  description:
    "Vote for a future educational topic. No account or email required.",
  path: "/tools/topic-vote",
});
export default function Page() {
  return (
    <ToolShell
      title="What should we explore next?"
      description="Good questions make better guides. Help shape what we work on next."
    >
      <TopicVote />
    </ToolShell>
  );
}
