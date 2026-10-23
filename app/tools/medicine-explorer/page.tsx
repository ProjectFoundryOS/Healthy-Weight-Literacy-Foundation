import { ToolShell } from "@/components/learning/tool-shell";
import { MedicineExplorer } from "@/components/learning/medicine-explorer";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Names, with a little context.",
  description:
    "Understand how ingredients, brands and approval status fit together.",
  path: "/tools/medicine-explorer",
});
export default function Page() {
  return (
    <ToolShell
      title={"Names, with a little context."}
      description={
        "Understand how ingredients, brands and approval status fit together."
      }
    >
      <MedicineExplorer />
    </ToolShell>
  );
}
