import { ToolShell } from "@/components/learning/tool-shell";
import { SupportFinder } from "@/components/learning/support-finder";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Find your next source of support.",
  description:
    "National directories to help you find services near you, wherever you live in the United States.",
  path: "/find-support",
});
export default function Page() {
  return (
    <ToolShell
      title={"Find your next source of support."}
      description={
        "National directories to help you find services near you, wherever you live in the United States."
      }
    >
      <SupportFinder />
    </ToolShell>
  );
}
