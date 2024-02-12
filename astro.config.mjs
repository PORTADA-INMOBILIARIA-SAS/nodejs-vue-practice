import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"
import vue from "@astrojs/vue"

// import netlify from "@astrojs/netlify";
import fastify from "@matthewp/astro-fastify"
// import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue()],
  output: "server",
  adapter: fastify({
    port: 8085,
  }),
})
