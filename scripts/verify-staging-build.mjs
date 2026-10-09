import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import path from 'node:path'
const dir=process.env.HWLF_LOCAL_STAGING_SNAPSHOT_DIR
assert(dir && process.env.HWLF_LOCAL_STAGING_FIXTURE==='true' && !process.env.CI && !process.env.VERCEL,'Isolated local staging required')
const raw=readFileSync(path.join(dir,'blog-posts.snapshot.json'),'utf8')
const manifest=JSON.parse(readFileSync(path.join(dir,'manifest.json'),'utf8'))
assert.equal(manifest.fixture,true)
assert.equal(createHash('sha256').update(raw).digest('hex'),manifest.sha256)
const posts=JSON.parse(raw);assert.equal(posts.length,1)
const post=posts[0];assert.equal(post.is_published,false);assert.equal(post.medical_reviewer,null)
const route=readFileSync(`.next/server/app/blog/${post.slug}.html`,'utf8')
const sitemap=readFileSync('.next/server/app/sitemap.xml.body','utf8')
for(const citation of post.citations)assert(route.includes(citation.url),'Missing rendered citation')
assert(route.includes(post.title));assert(route.includes('TEST ONLY'));assert(route.includes('Educational information, not medical advice.'))
assert(route.includes(`rel="canonical" href="https://weightliteracy.org/blog/${post.slug}"`),'Missing canonical')
assert(route.includes('application/ld+json'));assert(sitemap.includes(`/blog/${post.slug}</loc>`))
const receipt={verifiedAt:new Date().toISOString(),scope:'isolated local Next.js build, not deployed staging',fixture:true,slug:post.slug,title:post.title,citations:post.citations.length,medicalReviewer:null,isPublished:false,snapshotSha256:manifest.sha256,renderSha256:createHash('sha256').update(route).digest('hex'),sitemapSha256:createHash('sha256').update(sitemap).digest('hex'),checks:['source URL parity','article title','TEST ONLY label','medical disclaimer','canonical metadata','JSON-LD','sitemap route']}
mkdirSync('docs/article-engine',{recursive:true})
writeFileSync('docs/article-engine/STAGING_BUILD_RECEIPT.json',JSON.stringify(receipt,null,2)+'\n')
console.log(JSON.stringify(receipt,null,2))
