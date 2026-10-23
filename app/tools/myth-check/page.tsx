import { ToolShell } from "@/components/learning/tool-shell";
import { MythCheck } from "@/components/learning/myth-check";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Look a little closer.",
  description:
    "Some familiar health claims need a second look. Open a card to explore the evidence.",
  path: "/tools/myth-check",
});
export default function Page() {
  return (
    <ToolShell
      title={"Look a little closer."}
      description={
        "Some familiar health claims need a second look. Open a card to explore the evidence."
      }
    >
      <MythCheck />
    </ToolShell>
  );
}
