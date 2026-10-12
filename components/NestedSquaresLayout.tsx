import React, { useEffect, useState } from 'react';
import type { RecordModel } from 'pocketbase';
import { fileUrl, useCollection } from '@/lib/useCollection';

/* Sponsor logos come from the PocketBase "spnsor" collection: `pictre`
   is the image and `type` (1–5) picks the slot and size below. Records
   without a type are shown with the smallest logos (type 5). Within a
   type, logos keep the order they were added in PocketBase. */

type SponsorType = 1 | 2 | 3 | 4 | 5;

function sponsorType(record: RecordModel): SponsorType {
  const value = Number(record.type);
  return value >= 1 && value <= 5 ? (value as SponsorType) : 5;
}

export default function ExactSizeSquaresLayout() {
  const DESIGN_WIDTH = 1500;

  const getRatio = () =>
    Math.min((window.innerWidth - 10) / DESIGN_WIDTH, 1);

  const [ratio, setRatio] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      setRatio(getRatio());
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Original design dimensions — DO NOT CHANGE
  const type1Width = 720;
  const type1Height = 700;

  const type2Size = 270;
  const type3Size = 220;

  const type4Size = 120;
  const type5Size = 80;

  const gapSmall = 16;
  const gapRedGreen = 40;

  /* The bottom row wraps after 5 logos, as in the original design. */
  const type5RowWidth = 5 * type5Size + 4 * gapSmall;

  const s = (value: number) => value * ratio;

  // Images
  const { records } = useCollection('spnsor');

  const images: Record<SponsorType, string[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };
  for (const record of records) {
    const url = fileUrl(record, 'pictre');
    if (url) images[sponsorType(record)].push(url);
  }

  const logo = (image: string, size: { width: number; height: number }, rounded: string) => (
    <div
      key={image}
      className={`${rounded} overflow-hidden flex-shrink-0`}
      style={{
        width: s(size.width),
        height: s(size.height),
      }}
    >
      <img
        src={image}
        alt=""
        className="w-full h-full object-contain"
      />
    </div>
  );

  const square = (size: number) => ({ width: size, height: size });

  return (
    <div
      className="w-full min-h-screen bg-white flex flex-col items-center overflow-hidden"
      style={{
        padding: s(32),
        gap: s(16),
      }}
    >
      {/* TYPE 1 — ALONE AT THE TOP */}
      {images[1].map((image) =>
        logo(image, { width: type1Width, height: type1Height }, 'rounded-2xl')
      )}

      {/* BENTO — EVERYTHING ELSE */}
      <div
        className="flex items-start"
        style={{
          gap: s(gapSmall),
        }}
      >
        {/* LEFT BENTO SECTION */}
        <div
          className="flex flex-col"
          style={{
            gap: s(24),
          }}
        >
          {/* TYPE 3 — TWO IN ONE ROW */}
          {images[3].length > 0 && (
            <div
              className="grid grid-cols-2"
              style={{
                gap: s(24),
              }}
            >
              {images[3].map((image) => logo(image, square(type3Size), 'rounded-2xl'))}
            </div>
          )}

          {/* TYPE 4 + FIRST TYPE 2 */}
          {(images[4].length > 0 || images[2].length > 0) && (
            <div
              className="flex items-start flex-shrink-0"
              style={{
                gap: s(gapRedGreen),
              }}
            >
              {/* TYPE 4 STACK */}
              {images[4].length > 0 && (
                <div
                  className="flex flex-col flex-shrink-0"
                  style={{
                    gap: s(gapSmall),
                  }}
                >
                  {images[4].map((image) => logo(image, square(type4Size), 'rounded-xl'))}
                </div>
              )}

              {images[2].slice(0, 1).map((image) => logo(image, square(type2Size), 'rounded-2xl'))}
            </div>
          )}

          {/* TYPE 5 ROW */}
          {images[5].length > 0 && (
            <div
              className="flex flex-wrap flex-shrink-0"
              style={{
                gap: s(gapSmall),
                maxWidth: s(type5RowWidth),
              }}
            >
              {images[5].map((image) => logo(image, square(type5Size), 'rounded-lg'))}
            </div>
          )}
        </div>

        {/* RIGHT BENTO — OTHER TYPE 2 */}
        {images[2].length > 1 && (
          <div
            className="grid grid-cols-2 flex-shrink-0"
            style={{
              gap: s(gapRedGreen),
            }}
          >
            {images[2].slice(1).map((image) => logo(image, square(type2Size), 'rounded-2xl'))}
          </div>
        )}
      </div>
    </div>
  );
}
