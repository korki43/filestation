import { rootDir, blockedFiles } from "./mod.ts";
import { join } from "https://deno.land/std@0.125.0/path/mod.ts";

export const handleDelete = async (fileName: string) => {
  const filePath = join(rootDir, fileName);
  if (blockedFiles.includes(fileName)) {
    return new Response(null, { status: 403 });
  }

  try {
    await Deno.remove(filePath);
  } catch {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(null, { status: 204 });
};
