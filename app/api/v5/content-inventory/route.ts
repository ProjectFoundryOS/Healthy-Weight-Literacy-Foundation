import { NextResponse } from "next/server"
import { getBlogPosts } from "@/lib/supabase-blog"

export const dynamic = "force-dynamic"

export async function GET() {
  // Audit helper only. Never expose this endpoint from a production deployment.
  if (process.env.VERCEL_ENV === "production") {
    return new NextResponse(null, { status: 404 })
  }

  const posts = await getBlogPosts()
  const inventory = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    category: post.category,
    published_at: post.published_at,
    updated_at: post.updated_at,
    author: post.author,
    has_medical_disclaimer: post.has_medical_disclaimer,
    medical_reviewer_present: Boolean(post.medical_reviewer),
    reviewed_at: post.reviewed_at,
    next_review_date: post.next_review_date,
    citation_count: Array.isArray(post.citations) ? post.citations.length : 0,
  }))

  return NextResponse.json({
    source: "supabase.blog_posts published inventory",
    environment: process.env.VERCEL_ENV || "unknown",
    count: inventory.length,
    generated_at: new Date().toISOString(),
    inventory,
  })
}
