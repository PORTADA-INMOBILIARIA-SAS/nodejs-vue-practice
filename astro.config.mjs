import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"
import vue from "@astrojs/vue"
import netlify from "@astrojs/netlify"

import node from "@astrojs/node"

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue()],
  output: "hybrid",
  adapter: node({
    mode: "standalone",
  }),
})
