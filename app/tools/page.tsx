import Link from "next/link";
import { ToolShell, ToolCards } from "@/components/learning/tool-shell";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Tools for everyday understanding",
  description:
    "Free planners, short lessons, medicine explainers and printable resources.",
  path: "/tools",
});
export default function Page() {
  return (
    <ToolShell
      title="A little clarity. Something you can use."
      description="Explore, make a plan or try a new way of looking at a question. These tools are yours to use—no account required."
    >
      <ToolCards />
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Link className="learning-note" href="/start-here">
          <h2 className="text-xl font-semibold">Not sure where to begin?</h2>
          <p className="mt-2">Choose a guided starting point →</p>
        </Link>
        <Link className="learning-note" href="/find-support">
          <h2 className="text-xl font-semibold">
            Looking for practical support?
          </h2>
          <p className="mt-2">
            Find national directories for services near you →
          </p>
        </Link>
      </div>
    </ToolShell>
  );
}
