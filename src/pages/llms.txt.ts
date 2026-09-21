import { renderLlmsTxt } from "../lib/discovery";

export const prerender = true;

export function GET(): Response {
  return new Response(renderLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
