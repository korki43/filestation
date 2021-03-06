import { join } from "https://deno.land/std@0.125.0/path/mod.ts";
import { rootDir, blockedFiles } from "./mod.ts";

export const handleUpload = async (req: Request) => {
  const data = await req.formData();
  const file = data.get("file");
  if (!(file instanceof File)) {
    return new Response("Invalid Request", { status: 400 });
  }

  if (blockedFiles.includes(file.name) || file.name.includes("/")) {
    return new Response(null, { status: 403 });
  }

  const filePath = join(rootDir, file.name);
  const fileData = await file.arrayBuffer();
  try {
    await Deno.lstat(filePath);
    return new Response("exists", { status: 409 });
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }
  await Deno.writeFile(filePath, new Uint8Array(fileData));
  return new Response(null, { status: 201 });
};
