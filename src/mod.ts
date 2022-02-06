import { serve, Handler } from "https://deno.land/std@0.125.0/http/server.ts";
import { parse } from "https://deno.land/std@0.125.0/flags/mod.ts";
import { normalize } from "https://deno.land/std@0.125.0/path/mod.ts";
import { handleDownload } from "./download.ts";
import { handleUpload } from "./upload.ts";
import { handleDelete } from "./delete.ts";

interface Arguments {
  _: string[];
  list: boolean;
  verbose: boolean;
  port: string;
  index: string;
  root: string;
  block: string;
  path: string;
}

const args = parse(Deno.args, {
  boolean: ["list", "verbose"],
  string: ["port", "index", "root", "block", "path"],
  default: {
    port: "3000",
    list: true,
    verbose: false,
    block: "",
    index: "index.html",
    root: "files",
    path: "/",
  },
  alias: {
    port: "p",
    index: "i",
    verbose: "v",
  },
}) as Arguments;

const port = args.port;
const basePath = args.path;
export const verbose = args.verbose;
export const rootDir = args.root;
export const indexFile = args.index;
export const blockedFiles = args.block.split(",");
export const enableList = args.list;
if (enableList) blockedFiles.push("list");

if (verbose)
  console.log("Started with arguments:", {
    port,
    basePath,
    verbose,
    rootDir,
    indexFile,
    blockedFiles,
    enableList,
  });

const handleRequest: Handler = (req) => {
  try {
    let fileName = normalize(decodeURIComponent(new URL(req.url).pathname));
    if (fileName.startsWith(basePath))
      fileName = fileName.slice(basePath.length);
    if (fileName.endsWith("/")) fileName = fileName.slice(0, -1);
    if (fileName.startsWith("/")) fileName = fileName.slice(1);

    if (verbose) console.log(`${req.method} /${fileName}`);
    switch (req.method) {
      case "GET":
        return handleDownload(fileName);
      case "POST":
        return handleUpload(req);
      case "DELETE":
        return handleDelete(fileName);
      default:
        return new Response("Not Implemented", { status: 501 });
    }
  } catch (err) {
    console.error(err);
    return new Response("An Error occured", { status: 500 });
  }
};

console.log(`Server started on port ${port}.`);
await serve(handleRequest, { port: Number(port) });
