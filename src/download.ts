import { join } from "https://deno.land/std@0.125.0/path/mod.ts";
import { indexFile, rootDir, enableList } from "./mod.ts";
import { getContentType } from "./util.ts";

export const handleDownload = async (fileName: string) => {
  if (fileName == "") {
    return await sendFile(join(rootDir, indexFile));
  } else if (enableList && fileName == "list") {
    return await listFiles();
  }

  try {
    const filePath = join(rootDir, fileName);
    return await sendFile(filePath);
  } catch {
    return new Response("Not Found", { status: 404 });
  }
};

const listFiles = async () => {
  const files: string[] = [];
  for await (const dirEntry of Deno.readDir(rootDir)) {
    dirEntry.isFile && files.push(dirEntry.name);
  }
  return new Response(files.join("\n"), {
    status: 200,
    headers: new Headers({ "x-list": "true" }),
  });
};

const sendFile = async (filePath: string) => {
  const stats = await Deno.stat(filePath);
  if (!stats.isFile) throw new Error();
  const contentLength = stats.size;
  const file = await Deno.open(filePath);

  let bytesSent = 0;
  const body = new ReadableStream({
    async pull(controller) {
      const bytes = new Uint8Array(16_640);
      const bytesRead = await file.read(bytes);
      if (bytesRead === null) {
        file.close();
        controller.close();
        return;
      }
      controller.enqueue(
        bytes.slice(0, Math.min(bytesRead, contentLength - bytesSent))
      );
      bytesSent += bytesRead;
      if (bytesSent > contentLength) {
        file.close();
        controller.close();
      }
    },
  });

  const headers = new Headers();
  headers.set("content-length", `${contentLength}`);
  const contentType = getContentType(filePath);
  if (contentType) {
    headers.set("content-type", contentType);
  }

  return new Response(body, {
    headers,
    status: 200,
  });
};
