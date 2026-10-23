import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { sources, experiences } from "@/lib/learning/content";
export function ToolShell({
  eyebrow = "Tools for everyday understanding",
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="learning-page">
      <div className="learning-wrap">
        <nav aria-label="Breadcrumb" className="no-print mb-8 text-sm">
          <Link href="/education">Learn</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/tools">Tools & activities</Link>
        </nav>
        <div className="learning-intro">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="font-editorial mt-4 text-4xl tracking-tight sm:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
export function ToolCards() {
  return (
    <div className="learning-grid">
      {experiences.map((item) => (
        <Link key={item.slug} href={item.url} className="learning-card group">
          <div className="flex items-center justify-between">
            <span className="eyebrow">{item.kind}</span>
            <span className="tool-mark" aria-hidden="true">
              {item.mark}
            </span>
          </div>
          <h2 className="mt-8 text-2xl font-semibold tracking-tight">
            {item.title}
          </h2>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            {item.description}
          </p>
          <span className="mt-6 flex items-center gap-2 font-semibold text-primary">
            {item.short}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
      ))}
    </div>
  );
}
export function SourceNote({ source }: { source: keyof typeof sources }) {
  const item = sources[source];
  return (
    <p className="mt-5 text-sm text-muted-foreground">
      Source:{" "}
      <a
        className="underline underline-offset-4"
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.name}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </p>
  );
}
