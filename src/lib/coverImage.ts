import { supabase } from "./supabase";

export const COVER_PRELOAD_COUNT = 8;
export const COVER_EAGER_COUNT = 8;
export const COVER_HIGH_PRIORITY_COUNT = 4;

const CACHE_CONTROL = "31536000";
const WEBP_QUALITY = 0.8;

export interface CoverTarget {
  bucket: string;
  width: number;
  height: number;
}

/** Album art is square; film posters keep the standard 2:3 poster shape. */
export const ALBUM_COVER: CoverTarget = {
  bucket: "album-covers",
  width: 240,
  height: 240,
};

export const FILM_POSTER: CoverTarget = {
  bucket: "film-posters",
  width: 240,
  height: 360,
};

const preloadedHrefs = new Set<string>();

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> =>
  new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });

export const resizeCoverImage = async (
  source: Blob,
  { width, height }: Pick<CoverTarget, "width" | "height">
): Promise<File> => {
  const bitmap = await createImageBitmap(source);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not get canvas context");
  }

  // Center-crop the source to the target aspect ratio so the image fills the
  // frame without distortion, trimming whichever axis is proportionally longer.
  const targetAspect = width / height;
  const sourceAspect = bitmap.width / bitmap.height;
  const sw = sourceAspect > targetAspect ? bitmap.height * targetAspect : bitmap.width;
  const sh = sourceAspect > targetAspect ? bitmap.height : bitmap.width / targetAspect;
  const sx = (bitmap.width - sw) / 2;
  const sy = (bitmap.height - sh) / 2;

  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height);
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

export const uploadCover = async (
  file: Blob,
  target: CoverTarget
): Promise<string> => {
  const resized = await resizeCoverImage(file, target);
  const ext = resized.type === "image/webp" ? "webp" : "jpg";
  const fileName = `${Math.random().toString(36).substring(2)}.${ext}`;
  const filePath = `private/${fileName}`;

  const { data, error } = await supabase.storage
    .from(target.bucket)
    .upload(filePath, resized, {
      cacheControl: CACHE_CONTROL,
      contentType: resized.type,
      upsert: false,
    });

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from(target.bucket).getPublicUrl(data.path);

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
