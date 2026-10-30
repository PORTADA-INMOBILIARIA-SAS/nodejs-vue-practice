import { defineConfig } from "astro/config"
import vue from "@astrojs/vue"
import vercel from "@astrojs/vercel"
import tailwindcss from "@tailwindcss/vite"
import zlib from "node:zlib"

function devOptimizer() {
  return {
    name: "dev-optimizer",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const accept = req.headers["accept-encoding"] || ""
        if (
          req.method !== "GET" ||
          req.url?.includes("__vite_ping") ||
          req.url?.startsWith("/api/")
        ) {
          return next()
        }

        const origWriteHead = res.writeHead
        const origWrite = res.write
        const origEnd = res.end
        const chunks = []
        let bufferedStatus
        let bufferedArgs = []

        res.writeHead = function (status, ...args) {
          bufferedStatus = status
          bufferedArgs = args
          return this
        }

        res.write = function (chunk, ...args) {
          if (chunk)
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          return true
        }

        res.end = function (chunk, ...args) {
          if (chunk)
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
          let body = Buffer.concat(chunks)

          let contentType = ""
          if (bufferedArgs.length > 0 && typeof bufferedArgs[0] === "object") {
            contentType =
              bufferedArgs[0]["Content-Type"] ||
              bufferedArgs[0]["content-type"] ||
              ""
          }
          if (!contentType) {
            contentType = res.getHeader("content-type") || ""
          }

          if (typeof contentType === "string") {
            // Gzip text/html, javascript, and css
            if (
              accept.includes("gzip") &&
              (contentType.includes("text/html") ||
                contentType.includes("application/javascript") ||
                contentType.includes("text/css")) &&
              body.length > 512
            ) {
              try {
                const gz = zlib.gzipSync(body)
                res.setHeader("Content-Encoding", "gzip")
                res.setHeader("Content-Length", gz.length)
                if (bufferedStatus) {
                  origWriteHead.call(res, bufferedStatus, ...bufferedArgs)
                }
                return origEnd.call(res, gz)
              } catch {
                // fallback to uncompressed
              }
            }
          }

          if (bufferedStatus) {
            origWriteHead.call(res, bufferedStatus, ...bufferedArgs)
          }
          return origEnd.call(res, body)
        }

        next()
      })
    },
  }
}

export default defineConfig({
  integrations: [vue()],
  output: "server",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss(), devOptimizer()],
    build: {
      cssCodeSplit: false,
      chunkSizeWarningLimit: 1000,
      cssMinify: "esbuild",
    },
  },
  devToolbar: {
    enabled: false,
  },
})
