import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const imagesDirectory = path.join(projectDirectory, "src/assets/images");
const sourcePath = path.join(imagesDirectory, "icon_favicon.svg");

// PNG entries preserve the crisp vector monogram at each browser icon size.
function buildIconFile(entries) {
  const header = Buffer.alloc(6 + entries.length * 16);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(entries.length, 4);
  let imageOffset = header.length;

  entries.forEach(({ size, data }, index) => {
    const entryOffset = 6 + index * 16;
    header.writeUInt8(size, entryOffset);
    header.writeUInt8(size, entryOffset + 1);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(data.length, entryOffset + 8);
    header.writeUInt32LE(imageOffset, entryOffset + 12);
    imageOffset += data.length;
  });

  return Buffer.concat([header, ...entries.map(({ data }) => data)]);
}

for (const size of [32, 180, 192, 512]) {
  await sharp(sourcePath)
    .resize(size, size)
    .png()
    .toFile(path.join(imagesDirectory, `icon_favicon-${size}.png`));
}

const entries = await Promise.all([16, 32, 48].map(async size => ({ size, data: await sharp(sourcePath).resize(size, size).png().toBuffer() })));
await fs.writeFile(path.join(imagesDirectory, "icon_favicon.ico"), buildIconFile(entries));
console.log("Created TF favicon: SVG, ICO (16/32/48), PNG (32/180/192/512).");
