import { ToolShell } from "@/components/learning/tool-shell";
import { Toolkits } from "@/components/learning/toolkits";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Useful on paper, too.",
  description:
    "Simple worksheets for clearer conversations and everyday understanding.",
  path: "/tools/toolkits",
});
export default function Page() {
  return (
    <ToolShell
      title={"Useful on paper, too."}
      description={
        "Simple worksheets for clearer conversations and everyday understanding."
      }
    >
      <Toolkits />
    </ToolShell>
  );
}
