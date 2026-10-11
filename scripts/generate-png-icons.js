import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPngBuffer(width, height, colorRgb) {
  // Simple uncompressed valid PNG generator
  // RGBA format: 4 bytes per pixel + 1 filter byte per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Draw rounded card and checkmark design or gradient
      const cx = width / 2;
      const cy = height / 2;
      const dx = (x - cx) / (width / 2);
      const dy = (y - cy) / (height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Deep blue brand background with rounded border
      const isCorner = Math.abs(dx) > 0.85 && Math.abs(dy) > 0.85 && dist > 1.2;

      if (isCorner) {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0; // transparent
      } else {
        // Base color gradient: #1e3a8a to #0f172a
        let r = 30 + Math.floor(y / height * 10);
        let g = 58 + Math.floor(y / height * 20);
        let b = 138 + Math.floor(y / height * 30);

        // Center card (white)
        if (Math.abs(x - cx) < width * 0.32 && Math.abs(y - cy) < height * 0.32) {
          r = 255;
          g = 255;
          b = 255;

          // Inner checkmark in green
          // Checkmark line from (-0.1, 0) to (0, 0.1) to (0.15, -0.15)
          const relX = (x - cx) / (width * 0.32);
          const relY = (y - cy) / (height * 0.32);
          
          const inLine1 = (relX >= -0.3 && relX <= 0.0) && Math.abs((relX + 0.3) - (relY + 0.1)) < 0.12;
          const inLine2 = (relX >= 0.0 && relX <= 0.4) && Math.abs((0.4 - relX) - (relY + 0.5)) < 0.15;
          
          if (inLine1 || inLine2) {
            r = 16;
            g = 185;
            b = 129; // emerald green
          }
        }

        rawData[pxOffset] = r;
        rawData[pxOffset + 1] = g;
        rawData[pxOffset + 2] = b;
        rawData[pxOffset + 3] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT Chunk
  const idatChunk = createChunk('IDAT', compressed);

  // IEND Chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) | 0;
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPngBuffer(192, 192));
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPngBuffer(512, 512));
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPngBuffer(512, 512));
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPngBuffer(180, 180));

console.log('PNG icons created successfully!');
