import "server-only";
import sharp from "sharp";
import { PHOTO_MAX_DIMENSION_PX, PHOTO_JPEG_QUALITY } from "@/lib/constants/codes";

export interface CompressedPhoto {
  buffer: Buffer;
  contentType: string;
}

// 원본(최대 20MB)을 긴 변 기준으로 축소하고 JPEG로 재인코딩해 스토리지 용량과 대역폭을 줄인다.
// 클라이언트 압축은 실제 기기에서 크래시를 반복 유발해 포기했다 (lib/utils/imageProcessing.ts 참고) —
// 서버는 메모리 제약이 없는 sharp(libvips)로 안전하게 처리한다.
// Blob을 받는다 — Supabase Storage에서 방금 내려받은 원본은 File이 아니라 Blob이다.
export async function compressProductPhoto(file: Blob): Promise<CompressedPhoto> {
  const arrayBuffer = await file.arrayBuffer();

  const buffer = await sharp(Buffer.from(arrayBuffer))
    .rotate() // EXIF 방향 정보를 반영해 회전한 뒤 픽셀에 굽는다
    .resize({
      width: PHOTO_MAX_DIMENSION_PX,
      height: PHOTO_MAX_DIMENSION_PX,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: PHOTO_JPEG_QUALITY })
    .toBuffer();

  return { buffer, contentType: "image/jpeg" };
}
