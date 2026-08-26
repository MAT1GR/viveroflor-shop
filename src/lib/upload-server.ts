import { createServerFn } from "@tanstack/react-start";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const uploadImageFn = createServerFn({ method: "POST" })
  .validator((formData: FormData) => formData)
  .handler(async ({ data }) => {
    const file = data.get("file") as File;
    if (!file) throw new Error("No file provided");

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${crypto.randomUUID()}${ext}`;
    
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    return { url: `/uploads/${filename}` };
  });
