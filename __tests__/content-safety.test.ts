import test from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync,writeFileSync,readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { createHash } from "node:crypto"
import { loadContentSnapshotFrom } from "../lib/content-snapshot.ts"
import { resolveBlogPosts } from "../lib/content-resolution.ts"

const row={id:"test",slug:"test-staging",title:"TEST ONLY staging",content:"A long explicit staging fixture to exercise the content integrity loader without representing a real public article. ".repeat(2),is_published:true}
function snapshot(posts:unknown[],changes={}){
 const dir=mkdtempSync(path.join(tmpdir(),"art-b1-snapshot-"))
 const raw=JSON.stringify(posts)
 writeFileSync(path.join(dir,"blog-posts.snapshot.json"),raw)
 writeFileSync(path.join(dir,"manifest.json"),JSON.stringify({generatedAt:new Date().toISOString(),count:posts.length,sourceTable:"blog_posts",sha256:createHash("sha256").update(raw).digest("hex"),...changes}))
 return dir
}
test("valid snapshot, tamper, duplicate slug, empty body and unpublished row",()=>{
 assert.equal(loadContentSnapshotFrom(snapshot([row])).posts.length,1)
 for(const dir of [snapshot([row],{sha256:"tampered"}),snapshot([row,row]),snapshot([{...row,content:""}]),snapshot([{...row,is_published:false}])])assert.equal(loadContentSnapshotFrom(dir).posts.length,0)
})
test("missing live and snapshot fails closed, validated fallback succeeds",()=>{
 assert.throws(()=>resolveBlogPosts({ok:false,reason:"offline"},{posts:[],manifest:null,integrityError:null}),/zero article/)
 const valid=loadContentSnapshotFrom(snapshot([row]));assert.equal(resolveBlogPosts({ok:false,reason:"offline"},valid).posts.length,1)
 assert.equal(resolveBlogPosts({ok:true,data:[]},valid).source,"snapshot")
})
test("test snapshots cannot enter deployed environment",()=>{
 const original=process.env.HWLF_LOCAL_STAGING_FIXTURE,vercel=process.env.VERCEL,ci=process.env.CI
 try{
  delete process.env.HWLF_LOCAL_STAGING_FIXTURE;assert.equal(loadContentSnapshotFrom(snapshot([row],{fixture:true})).posts.length,0)
  process.env.HWLF_LOCAL_STAGING_FIXTURE="true";delete process.env.VERCEL;delete process.env.CI;assert.equal(loadContentSnapshotFrom(snapshot([row],{fixture:true})).posts.length,1)
  process.env.VERCEL="1";assert.equal(loadContentSnapshotFrom(snapshot([row],{fixture:true})).posts.length,0)
 }finally{for(const [key,value]of Object.entries({HWLF_LOCAL_STAGING_FIXTURE:original,VERCEL:vercel,CI:ci}))value===undefined?delete process.env[key]:process.env[key]=value}
})

test("deployed zero-content build cannot use local empty override",()=>{
 const old=process.env.ALLOW_EMPTY_ARTICLE_BUILD,vercel=process.env.VERCEL
 try{process.env.ALLOW_EMPTY_ARTICLE_BUILD="true";process.env.VERCEL="1";assert.throws(()=>resolveBlogPosts({ok:true,data:[]},{posts:[],manifest:null,integrityError:null}),/zero article/)}
 finally{for(const [key,value] of Object.entries({ALLOW_EMPTY_ARTICLE_BUILD:old,VERCEL:vercel}))value===undefined?delete process.env[key]:process.env[key]=value}
})
