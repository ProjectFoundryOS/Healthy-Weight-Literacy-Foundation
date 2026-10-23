import { ToolShell } from "@/components/learning/tool-shell";
import { AppointmentPlanner } from "@/components/learning/appointment-planner";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "A better conversation starts here.",
  description:
    "Make a little room for what matters to you. Choose questions, add your own and take a guide to your next appointment.",
  path: "/tools/appointment-planner",
});
export default function Page() {
  return (
    <ToolShell
      title={"A better conversation starts here."}
      description={
        "Make a little room for what matters to you. Choose questions, add your own and take a guide to your next appointment."
      }
    >
      <AppointmentPlanner />
    </ToolShell>
  );
}
