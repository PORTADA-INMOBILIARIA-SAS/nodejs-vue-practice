import type { APIRoute } from "astro"

export const GET: APIRoute = async () => {
  return new Response(
    `Hello, world!${import.meta.env.PUBLIC_HOLA} ${import.meta.env.SECRET_HOLA}`,
    {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
      },
    },
  )
}
