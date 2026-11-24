// main.ts — morning news-image entry for the make.fun news-image-20261124 bounty.
//
// The file next to this script, entry.png, is a single illustrated panel
// summing up the overnight news as it stood on the morning of Tuesday
// 24 November 2026:
//
//   - Nvidia brought Jensen Huang back as chief executive and the shares
//     jumped about 31%, lifting the S&P 500 roughly 4.7% and the Nasdaq
//     roughly 6.5%.
//   - The COP31 climate talks in Antalya fell apart with no deal agreed.
//   - Ukraine sank the Russian corvette Merkury off the Libyan coast
//     using sea drones.
//   - NATO moved AWACS surveillance aircraft to Poland after Russian
//     missiles came down on Polish soil.
//   - Iran said it would fight the American naval blockade.
//   - The Democrats took their largest House majority since 1992.
//   - Mexico arrested the cartel figure known as "El Chapo Isidro".
//   - Several US states sued Musk companies over sexualised images
//     produced by Grok.
//
// This script does one small job: it checks that the picture passes the
// bounty's gate (a whole PNG or JPEG, no more than 1 MiB, no side longer
// than 1024 pixels) and then places a copy at
// <MAKEFUN_OUTPUT_DIR or /output>/entry.png, printing a one-line summary.
//
// Run with:  node main.ts
// (Node 22+, standard library only — no dependencies to install.)

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// --- Bounty gate limits -------------------------------------------------

const MAX_BYTES = 1024 * 1024; // 1 MiB
const MAX_SIDE_PX = 1024; // longest allowed edge, in pixels
const INPUT_NAME = "entry.png";
const OUTPUT_NAME = "entry.png";

// --- Small helpers ------------------------------------------------------

interface Picture {
  kind: "PNG" | "JPEG";
  width: number;
  height: number;
}

function die(message: string): never {
  throw new Error(`entry check failed: ${message}`);
}

/** Read a big-endian 16-bit value out of a buffer at the given offset. */
function u16be(buf: Buffer, at: number): number {
  return buf.readUInt16BE(at);
}

/** Read a big-endian 32-bit value out of a buffer at the given offset. */
function u32be(buf: Buffer, at: number): number {
  return buf.readUInt32BE(at);
}

/** Width and height straight from a PNG's IHDR chunk (bytes 16-23). */
function pngDimensions(buf: Buffer): { width: number; height: number } {
  if (buf.length < 24) die("PNG file is truncated before its IHDR chunk");
  return { width: u32be(buf, 16), height: u32be(buf, 20) };
}

/**
 * Walk a JPEG's segments until a Start Of Frame marker (baseline,
 * extended-sequential or progressive) gives the dimensions. Markers
 * without a length field (SOI, EOI, RSTn, TEM) are stepped over.
 */
function jpegDimensions(buf: Buffer): { width: number; height: number } {
  let pos = 2; // skip the SOI marker (FF D8)
  while (pos + 3 < buf.length) {
    if (buf[pos] !== 0xff) die("JPEG segment markers are malformed");
    // Skip any run of padding 0xFF bytes before the marker code.
    let marker = buf[pos + 1];
    while (marker === 0xff) {
      pos += 1;
      marker = buf[pos + 1];
    }
    if (marker === 0xd9) die("reached end of JPEG without a frame header");
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      pos += 2; // standalone marker, no length field
      continue;
    }
    const segmentLength = u16be(buf, pos + 2);
    if (segmentLength < 2) die("JPEG segment has an impossible length");
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      const frameStart = pos + 4;
      if (frameStart + 5 > buf.length) die("JPEG frame header is truncated");
      return {
        height: u16be(buf, frameStart + 1),
        width: u16be(buf, frameStart + 3),
      };
    }
    pos += 2 + segmentLength;
  }
  die("no Start Of Frame marker found in JPEG");
}

/**
 * Identify the picture from its magic bytes and pull its dimensions
 * from the matching header. Returns null when the bytes are neither
 * PNG nor JPEG.
 */
function identify(buf: Buffer): Picture | null {
  const pngMagic = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  if (buf.length >= 8 && buf.subarray(0, 8).equals(pngMagic)) {
    return { kind: "PNG", ...pngDimensions(buf) };
  }
  if (
    buf.length >= 3 &&
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return { kind: "JPEG", ...jpegDimensions(buf) };
  }
  return null;
}

// --- Main flow ----------------------------------------------------------

const scriptDir = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(scriptDir, INPUT_NAME);

if (!existsSync(sourcePath)) {
  die(`could not find ${INPUT_NAME} beside this script`);
}

const bytes = readFileSync(sourcePath);
const byteCount = statSync(sourcePath).size;

if (byteCount !== bytes.length) die("file changed size while being read");
if (byteCount > MAX_BYTES) {
  die(`${INPUT_NAME} is ${byteCount} bytes, over the ${MAX_BYTES}-byte limit`);
}

const picture = identify(bytes);
if (picture === null) {
  die(`${INPUT_NAME} is neither a PNG nor a JPEG (magic bytes not recognised)`);
}
if (picture.width > MAX_SIDE_PX || picture.height > MAX_SIDE_PX) {
  die(
    `${INPUT_NAME} is ${picture.width}x${picture.height}px, ` +
      `over the ${MAX_SIDE_PX}x${MAX_SIDE_PX}px limit`,
  );
}
if (picture.width === 0 || picture.height === 0) {
  die(`${INPUT_NAME} reports a zero dimension`);
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
try {
  mkdirSync(outDir, { recursive: true });
} catch (err) {
  die(
    `could not create output directory ${outDir}: ` +
      `${err instanceof Error ? err.message : String(err)}`,
  );
}
const destPath = join(outDir, OUTPUT_NAME);
copyFileSync(sourcePath, destPath);

// Make sure the copy actually landed whole: the file on disk must be
// exactly as large as the one we read, or something went wrong mid-copy.
const writtenBytes = statSync(destPath).size;
if (writtenBytes !== byteCount) {
  die(
    `copy came out short: wrote ${writtenBytes} bytes, ` +
      `expected ${byteCount} bytes`,
  );
}

console.log(
  `accepted ${picture.kind} ${picture.width}x${picture.height}px, ` +
    `${byteCount} bytes -> ${destPath} (verified ${writtenBytes} bytes)`,
);
