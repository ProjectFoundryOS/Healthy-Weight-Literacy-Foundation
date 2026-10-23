import Link from "next/link";
import { ToolShell } from "@/components/learning/tool-shell";
import { lessons } from "@/lib/learning/content";
import { generatePageMetadata } from "@/lib/seo";
export const metadata = generatePageMetadata({
  title: "Short lessons",
  description:
    "One useful idea, a visual explanation and three questions to put it into practice.",
  path: "/education/lessons",
});
export default function Page() {
  return (
    <ToolShell
      eyebrow="Small steps in understanding"
      title="One idea at a time."
      description="A few minutes, a clear explanation and three questions to help you put the idea into words."
    >
      <div className="learning-grid">
        {lessons.map((l, i) => (
          <Link
            className="learning-card"
            href={`/education/lessons/${l.slug}`}
            key={l.slug}
          >
            <span className="tool-mark">0{i + 1}</span>
            <h2 className="font-editorial mt-6 text-3xl">{l.title}</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              {l.intro}
            </p>
            <span className="text-link mt-6">Try the lesson →</span>
          </Link>
        ))}
      </div>
    </ToolShell>
  );
}
