import { serwist } from "@serwist/next/config";

// Built after `next build` so prerendered pages can be precached.
// The service worker is disabled in development by SerwistProvider.
export default await serwist({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
});
