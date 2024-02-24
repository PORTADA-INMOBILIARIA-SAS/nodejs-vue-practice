import tailwind from "@astrojs/tailwind"
import { defineConfig } from "astro/config"
import vue from "@astrojs/vue"
// import netlify from "@astrojs/netlify";

import vercel from "@astrojs/vercel/serverless"

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), vue()],
  output: "server",
  adapter: vercel(),
})
