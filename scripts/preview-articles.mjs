import { spawn } from "node:child_process"
import { resolve } from "node:path"
import { isEditorialPreview } from "../lib/editorial-preview-mode.mjs"

const env = {
  ...process.env,
  NODE_ENV: "development",
  HWLF_EDITORIAL_PREVIEW_DIR: resolve(process.argv[2] || "../editorial"),
}
isEditorialPreview(env)
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--webpack", "--hostname", "127.0.0.1", "--port", "3100"], {
  stdio: "inherit", env,
})
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal))
child.on("exit", (code) => { process.exitCode = code ?? 1 })
