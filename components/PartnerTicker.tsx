import React from 'react';

export default function PartnerTicker() {
  const partners = [
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