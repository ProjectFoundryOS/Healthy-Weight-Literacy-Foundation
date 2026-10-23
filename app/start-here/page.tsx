import { ToolShell } from "@/components/learning/tool-shell";
import { StartPaths } from "@/components/learning/start-paths";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Where would you like to begin?",
  description:
    "You do not need to know all the right terms. Start with the question that brought you here.",
  path: "/start-here",
});
export default function Page() {
  return (
    <ToolShell
      title={"Where would you like to begin?"}
      description={
        "You do not need to know all the right terms. Start with the question that brought you here."
      }
    >
      <StartPaths />
    </ToolShell>
  );
}
