import { supabase } from "./supabase";

export const COVER_SIZE = 240;
export const COVER_PRELOAD_COUNT = 8;
export const COVER_EAGER_COUNT = 8;
export const COVER_HIGH_PRIORITY_COUNT = 4;

const BUCKET = "album-covers";
const CACHE_CONTROL = "31536000";
const WEBP_QUALITY = 0.8;

const preloadedHrefs = new Set<string>();

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

export const resizeCoverImage = async (source: Blob): Promise<File> => {
  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement("canvas");
  canvas.width = COVER_SIZE;
  canvas.height = COVER_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not get canvas context");
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - side) / 2;
  const sy = (bitmap.height - side) / 2;
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, COVER_SIZE, COVER_SIZE);
  bitmap.close();

  const webp = await canvasToBlob(canvas, "image/webp", WEBP_QUALITY);
  if (webp) {
    return new File([webp], "cover.webp", { type: "image/webp" });
  }

  const jpeg = await canvasToBlob(canvas, "image/jpeg", WEBP_QUALITY);
  if (!jpeg) {
    throw new Error("Failed to encode cover image");
  }
  return new File([jpeg], "cover.jpg", { type: "image/jpeg" });
};

export const uploadAlbumCover = async (file: Blob): Promise<string> => {
  const resized = await resizeCoverImage(file);
  const ext = resized.type === "image/webp" ? "webp" : "jpg";
  const fileName = `${Math.random().toString(36).substring(2)}.${ext}`;
  const filePath = `private/${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, resized, {
      cacheControl: CACHE_CONTROL,
      contentType: resized.type,
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return publicUrl;
};

export const preloadCoverImages = (urls: string[]): void => {
  for (const href of urls) {
    if (!href || preloadedHrefs.has(href)) continue;
    preloadedHrefs.add(href);
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    document.head.appendChild(link);
  }
};
