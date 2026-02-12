/**
 * Generate placeholder PWA icons as PNG files using only Node.js built-ins.
 * Creates simple sage-green squares with "BNJ" block letters.
 * Run: node scripts/generate-icons.mjs
 */

import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { deflateSync } from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));

function createPNG(width, height, drawFn) {
  // RGBA pixel buffer
  const pixels = new Uint8Array(width * height * 4);

  const ctx = {
    fillRect(x, y, w, h, [r, g, b, a]) {
      for (let py = y; py < y + h && py < height; py++) {
        for (let px = x; px < x + w && px < width; px++) {
          if (px >= 0 && py >= 0) {
            const i = (py * width + px) * 4;
            pixels[i] = r;
            pixels[i + 1] = g;
            pixels[i + 2] = b;
            pixels[i + 3] = a;
          }
        }
      }
    },
  };

  drawFn(ctx, width, height);

  // Build PNG raw data (each row prefixed with filter byte 0)
  const raw = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    raw[rowOffset] = 0; // No filter
    pixels.copy
      ? Buffer.from(pixels.buffer).copy(raw, rowOffset + 1, y * width * 4, (y + 1) * width * 4)
      : raw.set(pixels.slice(y * width * 4, (y + 1) * width * 4), rowOffset + 1);
  }

  const compressed = deflateSync(Buffer.from(raw));

  // Build PNG file
  const chunks = [];

  // Signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  chunks.push(makeChunk('IHDR', ihdr));

  // IDAT
  chunks.push(makeChunk('IDAT', compressed));

  // IEND
  chunks.push(makeChunk('IEND', Buffer.alloc(0)));

  return Buffer.concat(chunks);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);

  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData) >>> 0);

  return Buffer.concat([len, typeB, data, crc]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return c ^ 0xffffffff;
}

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c;
}

function drawIcon(ctx, size) {
  const bg = [124, 144, 130, 255];   // sage green #7C9082
  const fg = [250, 249, 247, 255];   // warm white #FAF9F7

  // Fill background
  ctx.fillRect(0, 0, size, size, bg);

  // Draw "BNJ" block letters
  const t = Math.max(Math.floor(size * 0.04), 2); // stroke thickness
  const lw = Math.floor(size * 0.18);              // letter width
  const lh = Math.floor(size * 0.28);              // letter height
  const gap = Math.floor(size * 0.04);             // letter gap
  const totalW = lw * 3 + gap * 2;
  const sx = Math.floor((size - totalW) / 2);      // start x (centered)
  const sy = Math.floor((size - lh) / 2);          // start y (centered)

  // B
  let x = sx;
  ctx.fillRect(x, sy, t, lh, fg);                                // left bar
  ctx.fillRect(x, sy, Math.floor(lw * 0.85), t, fg);             // top
  ctx.fillRect(x, sy + Math.floor(lh / 2) - Math.floor(t / 2), Math.floor(lw * 0.85), t, fg); // mid
  ctx.fillRect(x, sy + lh - t, Math.floor(lw * 0.85), t, fg);   // bottom
  ctx.fillRect(x + Math.floor(lw * 0.85) - t, sy, t, Math.floor(lh / 2) + Math.floor(t / 2), fg); // right top
  ctx.fillRect(x + Math.floor(lw * 0.85) - t, sy + Math.floor(lh / 2) - Math.floor(t / 2), t, Math.floor(lh / 2) + Math.floor(t / 2), fg); // right bot

  // N
  x += lw + gap;
  ctx.fillRect(x, sy, t, lh, fg);                   // left bar
  ctx.fillRect(x + lw - t, sy, t, lh, fg);          // right bar
  const steps = Math.floor(lh / t);
  for (let i = 0; i < steps; i++) {
    const dx = x + Math.floor((i / steps) * (lw - t));
    const dy = sy + i * t;
    ctx.fillRect(dx, dy, t + 1, t + 1, fg);
  }

  // J
  x += lw + gap;
  ctx.fillRect(x, sy, lw, t, fg);                                          // top bar
  const jMid = x + Math.floor(lw / 2) - Math.floor(t / 2);
  ctx.fillRect(jMid, sy, t, lh, fg);                                       // vertical
  ctx.fillRect(x, sy + lh - t, Math.floor(lw / 2) + Math.floor(t / 2), t, fg); // bottom
  ctx.fillRect(x, sy + lh - t * 3, t, t * 3, fg);                         // hook
}

// Generate both sizes
for (const size of [192, 512]) {
  const png = createPNG(size, size, (ctx, w) => drawIcon(ctx, w));
  const outPath = join(__dirname, '..', 'public', 'icons', `icon-${size}x${size}.png`);
  writeFileSync(outPath, png);
  console.log(`Generated: public/icons/icon-${size}x${size}.png (${png.length} bytes)`);
}
