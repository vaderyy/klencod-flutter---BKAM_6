/**
 * Client-side image processing: builds a small display-ready data URL plus a
 * perceptual fingerprint (average hash + difference hash + mean color) used to
 * recognize products without any cloud service.
 */

export interface ProcessedImage {
  dataUrl: string;
  ahash: string;
  dhash: string;
  color: [number, number, number];
}

const STORE_SIZE = 360;
const HASH_W = 16;
const HASH_H = 16;

function coverRect(srcW: number, srcH: number) {
  const side = Math.min(srcW, srcH);
  return { sx: (srcW - side) / 2, sy: (srcH - side) / 2, side };
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function bitsToHex(bits: boolean[]): string {
  let out = "";
  for (let i = 0; i < bits.length; i += 4) {
    let n = 0;
    for (let j = 0; j < 4; j++) {
      if (bits[i + j]) n |= 1 << (3 - j);
    }
    out += n.toString(16);
  }
  return out;
}

interface DrawSource {
  width: number;
  height: number;
  draw: (ctx: CanvasRenderingContext2D, sx: number, sy: number, s: number, w: number, h: number) => void;
}

function process(source: DrawSource): ProcessedImage {
  const { sx, sy, side } = coverRect(source.width, source.height);

  // Stored (temporary) preview image
  const store = makeCanvas(STORE_SIZE, STORE_SIZE);
  const sctx = store.getContext("2d")!;
  source.draw(sctx, sx, sy, side, STORE_SIZE, STORE_SIZE);
  const dataUrl = store.toDataURL("image/jpeg", 0.82);

  // 16x16 sample → gray levels + average color + aHash
  const c16 = makeCanvas(HASH_W, HASH_H);
  const ctx16 = c16.getContext("2d", { willReadFrequently: true })!;
  source.draw(ctx16, sx, sy, side, HASH_W, HASH_H);
  const d16 = ctx16.getImageData(0, 0, HASH_W, HASH_H).data;

  const gray: number[] = new Array(HASH_W * HASH_H);
  let sum = 0;
  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = 0; i < HASH_W * HASH_H; i++) {
    const o = i * 4;
    r += d16[o];
    g += d16[o + 1];
    b += d16[o + 2];
    gray[i] = 0.299 * d16[o] + 0.587 * d16[o + 1] + 0.114 * d16[o + 2];
    sum += gray[i];
  }
  const mean = sum / gray.length;
  const ahash = bitsToHex(gray.map((v) => v >= mean));
  const px = HASH_W * HASH_H;
  const color: [number, number, number] = [r / px, g / px, b / px];

  // 17x16 sample → dHash (horizontal gradient)
  const DW = HASH_W + 1;
  const c17 = makeCanvas(DW, HASH_H);
  const ctx17 = c17.getContext("2d", { willReadFrequently: true })!;
  source.draw(ctx17, sx, sy, side, DW, HASH_H);
  const d17 = ctx17.getImageData(0, 0, DW, HASH_H).data;

  const dBits: boolean[] = [];
  for (let y = 0; y < HASH_H; y++) {
    for (let x = 0; x < DW - 1; x++) {
      const o1 = (y * DW + x) * 4;
      const o2 = (y * DW + x + 1) * 4;
      const g1 = 0.299 * d17[o1] + 0.587 * d17[o1 + 1] + 0.114 * d17[o1 + 2];
      const g2 = 0.299 * d17[o2] + 0.587 * d17[o2 + 1] + 0.114 * d17[o2 + 2];
      dBits.push(g1 > g2);
    }
  }
  const dhash = bitsToHex(dBits);

  return { dataUrl, ahash, dhash, color };
}

export function processVideoFrame(video: HTMLVideoElement): Promise<ProcessedImage> {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (!vw || !vh) return Promise.reject(new Error("Camera not ready"));
  return Promise.resolve(
    process({
      width: vw,
      height: vh,
      draw: (ctx, sx, sy, s, w, h) => ctx.drawImage(video, sx, sy, s, s, 0, 0, w, h),
    }),
  );
}

export async function processFile(file: File): Promise<ProcessedImage> {
  const bitmap = await createImageBitmap(file);
  try {
    return process({
      width: bitmap.width,
      height: bitmap.height,
      draw: (ctx, sx, sy, s, w, h) => ctx.drawImage(bitmap, sx, sy, s, s, 0, 0, w, h),
    });
  } finally {
    bitmap.close();
  }
}
