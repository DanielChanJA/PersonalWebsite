import { renderSitemapXml } from "../lib/discovery";

export const prerender = true;

export function GET(): Response {
  return new Response(renderSitemapXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}
