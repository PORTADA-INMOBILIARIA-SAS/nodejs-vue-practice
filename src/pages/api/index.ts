import type { DefineFastifyRoutes } from "@matthewp/astro-fastify"

const defineRoutes: DefineFastifyRoutes = (fastify) => {
  fastify.get("/api/todos", function (_, reply) {
    reply.send("Hello World")
  })
}

export default defineRoutes
