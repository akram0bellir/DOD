'use client';

import React from 'react';
import { fileUrls, useCollection } from '@/lib/useCollection';

export default function PartnerTicker() {
  /* Logos from the PocketBase "Media" collection (field "picter") */
  const { records, loading } = useCollection('Media');
  const dbPartners = records.flatMap((record) => fileUrls(record, 'picter'));

  /* Shown only while the "Media" collection is empty or unreachable. */
  const fallbackPartners = [
    '/imm/CVXRXVNDQOVPD.png',
    '/imm/CZNGCRPRGROXX.png',
    '/imm/FGLDRMOHHHOGG.png',
    '/imm/FMJVPQHXUWXDD.png',
    '/imm/KRJSQROQYXYYJ.png',
    '/imm/PODXYGFRLANEZ.png',
    '/imm/RDLHQJWCBFFND.png',
    '/imm/VZORYURSUQEYW.png',
    '/imm/DLKARJLSJEUXM.png',
  ];
  const partners = dbPartners.length > 0 ? dbPartners : loading ? [] : fallbackPartners;

  return (
    <div className="w-full border-b border-gray-200 bg-white py-12 overflow-hidden">
      <div className="flex w-max animate-ticker gap-12 items-center">
        {[...partners, ...partners, ...partners].map((logo, index) => (
          <div
            key={index}
            className="w-[200px] h-[200px] flex items-center justify-center p-4 shrink-0"
          >
            <img
              src={logo}
              alt=""
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .animate-ticker {
          animation: ticker 25s linear infinite;
        }

        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}