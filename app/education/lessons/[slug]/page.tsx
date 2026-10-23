import { notFound } from "next/navigation";
import { lessons } from "@/lib/learning/content";
import { LessonPlayer } from "@/components/learning/lesson-player";
import { ToolShell } from "@/components/learning/tool-shell";
import { generatePageMetadata } from "@/lib/seo";
export function generateStaticParams() {
  return lessons.map((l) => ({ slug: l.slug }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const l = lessons.find((l) => l.slug === slug);
  return l
    ? generatePageMetadata({
        title: l.title,
        description: l.intro,
        path: `/education/lessons/${l.slug}`,
      })
    : {};
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const l = lessons.find((l) => l.slug === slug);
  if (!l) notFound();
  return (
    <ToolShell
      eyebrow="A short lesson · Three questions"
      title={l.title}
      description={l.intro}
    >
      <LessonPlayer lesson={l} />
    </ToolShell>
  );
}
