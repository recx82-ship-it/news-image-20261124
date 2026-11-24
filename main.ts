// News-image entry for Tuesday 24 November 2026, MORNING version (Node 22,
// standard library only). The entry image is entry.png beside this file: a
// newspaper front page summing up the OVERNIGHT news of Monday 23 November
// into Tuesday 24 November 2026 — Nvidia reinstating Jensen Huang as CEO and
// Wall Street roaring back (shares +31%, S&P 500 +4.7%, Nasdaq +6.5%), COP31
// collapsing in Antalya with no deal, Ukraine sinking the Russian corvette
// Merkury off Libya with sea drones, NATO sending AWACS to Poland after
// Russian missiles landed there, Iran vowing to fight the US naval blockade,
// Democrats winning their biggest House majority since 1992, Mexico capturing
// cartel boss 'El Chapo Isidro', and US states suing Musk's firms over Grok
// sexualised images. Built from overnight news only; an evening rebuild from
// the full day's news will replace it in a later run.
// The program checks the image against the bounty gate (whole PNG or JPEG,
// at most 1 MiB, at most 1024 by 1024 pixels) and writes it to
// /output/entry.png, the path the grader reads.

import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const OUT_NAME = 'entry.png';
const SRC = new URL(`./${OUT_NAME}`, import.meta.url);
const image = readFileSync(SRC);

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47];
const JPEG_MAGIC = [0xff, 0xd8, 0xff];

function hasMagic(buf: Buffer, magic: number[]): boolean {
  return magic.every((byte, i) => buf[i] === byte);
}

const isPng = hasMagic(image, PNG_MAGIC);
const isJpeg = hasMagic(image, JPEG_MAGIC);
if (!isPng && !isJpeg) {
  throw new Error('entry.png is neither a PNG nor a JPEG');
}
if (image.length > 1024 * 1024) {
  throw new Error(`entry.png is ${image.length} bytes, over the 1 MiB gate`);
}

function pngSize(buf: Buffer): [number, number] {
  return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
}

function jpegSize(buf: Buffer): [number, number] {
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) throw new Error('corrupt JPEG marker stream');
    const marker = buf[offset + 1];
    const length = buf.readUInt16BE(offset + 2);
    if (marker === 0xc0 || marker === 0xc2) {
      return [buf.readUInt16BE(offset + 7), buf.readUInt16BE(offset + 5)];
    }
    offset += 2 + length;
  }
  throw new Error('no JPEG start-of-frame segment found');
}

const [width, height] = isPng ? pngSize(image) : jpegSize(image);
if (width > 1024 || height > 1024) {
  throw new Error(`image is ${width}x${height}, over the 1024x1024 gate`);
}

mkdirSync(OUT_DIR, { recursive: true });
const dest = join(OUT_DIR, OUT_NAME);
copyFileSync(SRC, dest);
const written = statSync(dest);
console.log(
  `Entry image: ${isJpeg ? 'JPEG' : 'PNG'}, ${width}x${height}, ` +
  `${image.length} bytes, copied to ${dest} (${written.size} bytes)`,
);
