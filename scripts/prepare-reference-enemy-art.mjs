import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "src/assets/enemies/reference");
const outputDir = path.join(root, "src/assets/enemies/prepared-reference");
const manifestPath = path.join(root, "src/assets/enemies/reference-crop-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c >>> 0;
}
function crc32(buffer) {
  let c = 0xffffffff;
  for (const value of buffer) c = crcTable[(c ^ value) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const out = Buffer.alloc(data.length + 12);
  out.writeUInt32BE(data.length, 0);
  name.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([name, data])), data.length + 8);
  return out;
}
function decodePng(buffer) {
  const signature = Buffer.from([137,80,78,71,13,10,26,10]);
  if (!buffer.subarray(0, 8).equals(signature)) throw new Error("Invalid PNG signature");
  let offset = 8, width, height, bitDepth, colorType, interlace;
  const idat = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset); const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length); offset += length + 12;
    if (type === "IHDR") {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      bitDepth = data[8]; colorType = data[9]; interlace = data[12];
    } else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
  }
  if (bitDepth !== 8 || ![2, 6].includes(colorType) || interlace !== 0) {
    throw new Error("Only non-interlaced 8-bit RGB/RGBA PNGs are supported");
  }
  const channels = colorType === 6 ? 4 : 3, stride = width * channels;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const pixels = Buffer.alloc(height * stride);
  let p = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[p++];
    for (let x = 0; x < stride; x += 1) {
      const value = raw[p++], left = x >= channels ? pixels[y * stride + x - channels] : 0;
      const up = y ? pixels[(y - 1) * stride + x] : 0;
      const upperLeft = y && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      let predictor = 0;
      if (filter === 1) predictor = left;
      else if (filter === 2) predictor = up;
      else if (filter === 3) predictor = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const estimate = left + up - upperLeft;
        const dl = Math.abs(estimate - left), du = Math.abs(estimate - up), dul = Math.abs(estimate - upperLeft);
        predictor = dl <= du && dl <= dul ? left : du <= dul ? up : upperLeft;
      } else if (filter !== 0) throw new Error("Unsupported PNG filter");
      pixels[y * stride + x] = (value + predictor) & 255;
    }
  }
  return { width, height, channels, pixels };
}
function encodePng(width, height, rgba) {
  const rows = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y += 1) rgba.copy(rows, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(rows, { level: 9 })), chunk("IEND", Buffer.alloc(0)),
  ]);
}
function isBackdrop(r, g, b) {
  const blueScene = b > r * 1.10 && b > g * 0.98 && b - r > 18;
  const darkBlue = b > r * 1.18 && b > g * 1.02 && b < 150;
  const paleIce = b > 165 && g > 165 && b >= r * 0.98 && Math.abs(g - b) < 48;
  return blueScene || darkBlue || paleIce;
}
function removeConnectedBackdrop(image) {
  const { width, height, channels, pixels } = image;
  const total = width * height, transparent = new Uint8Array(total), queue = new Int32Array(total);
  let head = 0, tail = 0;
  const eligible = (index) => {
    const i = index * channels, r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
    return isBackdrop(r, g, b);
  };
  const add = (index) => {
    if (index < 0 || index >= total || transparent[index] || !eligible(index)) return;
    transparent[index] = 1; queue[tail++] = index;
  };
  for (let x = 0; x < width; x += 1) { add(x); add((height - 1) * width + x); }
  for (let y = 0; y < height; y += 1) { add(y * width); add(y * width + width - 1); }
  while (head < tail) {
    const index = queue[head++], x = index % width, y = Math.floor(index / width);
    if (x) add(index - 1); if (x + 1 < width) add(index + 1);
    if (y) add(index - width); if (y + 1 < height) add(index + width);
  }
  const rgba = Buffer.alloc(total * 4);
  let minX = width, minY = height, maxX = -1, maxY = -1, removed = 0;
  for (let index = 0; index < total; index += 1) {
    const src = index * channels, dst = index * 4, x = index % width, y = Math.floor(index / width);
    rgba[dst] = pixels[src]; rgba[dst + 1] = pixels[src + 1]; rgba[dst + 2] = pixels[src + 2];
    rgba[dst + 3] = transparent[index] ? 0 : (channels === 4 ? pixels[src + 3] : 255);
    if (transparent[index]) removed += 1;
    else if (rgba[dst + 3]) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); }
  }
  if (maxX < minX || maxY < minY) throw new Error("Background removal erased the entire subject");
  const subjectWidth = maxX - minX + 1, subjectHeight = maxY - minY + 1;
  const scale = Math.min(112 / subjectWidth, 112 / subjectHeight, 1);
  const outWidth = Math.max(1, Math.round(subjectWidth * scale)), outHeight = Math.max(1, Math.round(subjectHeight * scale));
  const canvas = Buffer.alloc(128 * 128 * 4);
  for (let y = 0; y < outHeight; y += 1) for (let x = 0; x < outWidth; x += 1) {
    const sx = minX + Math.min(subjectWidth - 1, Math.floor(x / scale));
    const sy = minY + Math.min(subjectHeight - 1, Math.floor(y / scale));
    const src = (sy * width + sx) * 4;
    const dx = Math.floor((128 - outWidth) / 2) + x, dy = Math.floor((128 - outHeight) / 2) + y;
    rgba.copy(canvas, (dy * 128 + dx) * 4, src, src + 4);
  }
  return { png: encodePng(128, 128, canvas), removedRatio: removed / total };
}
fs.mkdirSync(outputDir, { recursive: true });
const report = [];
for (const crop of manifest.crops) {
  const input = path.join(sourceDir, crop.file);
  if (!fs.existsSync(input)) throw new Error(`Missing reference crop: ${crop.file}`);
  const prepared = removeConnectedBackdrop(decodePng(fs.readFileSync(input)));
  const outputName = crop.file.replace(/\.png$/i, ".png");
  fs.writeFileSync(path.join(outputDir, outputName), prepared.png);
  report.push({ source: crop.file, output: outputName, size: "128x128", removedBackdropRatio: Number(prepared.removedRatio.toFixed(3)), status: "static-cutout-review-required" });
}
fs.writeFileSync(path.join(outputDir, "preparation-report.json"), JSON.stringify({
  source: "user-uploaded reference crops",
  generatedAt: new Date().toISOString(),
  count: report.length,
  note: "These are automatically segmented static cutouts. Inspect edges and subject integrity before production use. No animation frames are fabricated.",
  assets: report,
}, null, 2) + "\n");
console.log(`Prepared ${report.length} transparent static reference cutouts in ${path.relative(root, outputDir)}. Manual visual review and animation authoring remain required.`);
