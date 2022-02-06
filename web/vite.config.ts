import { defineConfig, IndexHtmlTransformContext, Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import htmlMinimize from "@sergeymakinen/vite-plugin-html-minimize";

const viteClean: Plugin = {
  name: "vite:clean",
  transformIndexHtml: {
    enforce: "post",
    transform(html, ctx) {
      if (!ctx || !ctx.bundle) return html;
      for (const [, value] of Object.entries(ctx.bundle)) {
        delete ctx.bundle[value.fileName];
      }
      return html;
    },
  },
};

export default defineConfig({
  plugins: [viteSingleFile(), viteClean, htmlMinimize()],
  build: {
    target: "es2017",
    cssCodeSplit: false,
    outDir: "../files",
  },
});
