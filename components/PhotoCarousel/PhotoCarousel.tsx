"use client";

import { useEffect, useRef, useState } from "react";

interface Photo {
  src: string;
  alt?: string;
}

interface PhotoCarouselProps {
  photos: Photo[];
  className?: string;
}

// 스와이프로 넘기는 단일 사진 캐러셀 — 하단에 n/총 개수 인디케이터, 탭하면 전체 화면으로 확대
export function PhotoCarousel({ photos, className }: PhotoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpenAt, setLightboxOpenAt] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const lightboxTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lightboxOpenAt === null) return;
    const track = lightboxTrackRef.current;
    if (!track) return;
    track.scrollLeft = lightboxOpenAt * track.clientWidth;
    setLightboxIndex(lightboxOpenAt);
  }, [lightboxOpenAt]);

  if (photos.length === 0) return null;

  return (
    <>
      <div className={`relative ${className ?? ""}`}>
        <div
          onScroll={(event) => {
            const track = event.currentTarget;
            setIndex(Math.round(track.scrollLeft / track.clientWidth));
          }}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto rounded-2xl"
        >
          {photos.map((photo, i) => (
            <button
              key={photo.src}
              type="button"
              onClick={() => setLightboxOpenAt(i)}
              className="h-full w-full shrink-0 snap-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt ?? ""}
                className="h-full w-full rounded-2xl bg-surface-2 object-cover"
              />
            </button>
          ))}
        </div>
        {photos.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 font-body text-[10.5px] text-white">
            {index + 1}/{photos.length}
          </span>
        )}
      </div>

      {lightboxOpenAt !== null && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/85"
          onClick={() => setLightboxOpenAt(null)}
        >
          <div
            ref={lightboxTrackRef}
            onScroll={(event) => {
              const track = event.currentTarget;
              setLightboxIndex(Math.round(track.scrollLeft / track.clientWidth));
            }}
            className="flex h-full w-full snap-x snap-mandatory overflow-x-auto"
          >
            {photos.map((photo) => (
              <div
                key={photo.src}
                className="flex h-full w-full shrink-0 snap-center items-center justify-center p-4"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt ?? ""}
                  onClick={(event) => event.stopPropagation()}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ))}
          </div>
          {photos.length > 1 && (
            <span className="absolute bottom-6 rounded-full bg-black/60 px-3 py-1 font-body text-xs text-white">
              {lightboxIndex + 1}/{photos.length}
            </span>
          )}
        </div>
      )}
    </>
  );
}
