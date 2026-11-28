import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const version = "0.6.1";
const fileName = `rigby2d-phaser-${version}.mjs`;
const url = `https://github.com/jaisurya-dev-art/rigby2d/releases/download/v${version}/${fileName}`;
const expectedSha256 = "cc3a5435c8cc1daccede5a2e40add9be78e5837253b5ca48caf57ec95ee67f7a";
const outputDir = path.join(root, "src/vendor");
const outputPath = path.join(outputDir, fileName);

fs.mkdirSync(outputDir, { recursive: true });
const response = await fetch(url, { redirect: "follow" });
if (!response.ok) throw new Error(`Rigby2D runtime download failed: HTTP ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
const actualSha256 = createHash("sha256").update(bytes).digest("hex");
if (actualSha256 !== expectedSha256) {
  throw new Error(`Rigby2D runtime checksum mismatch: expected ${expectedSha256}, received ${actualSha256}`);
}
fs.writeFileSync(outputPath, bytes);
console.log(`Fetched and checksum-verified Rigby2D Phaser ${version} runtime (${bytes.length} bytes).`);
