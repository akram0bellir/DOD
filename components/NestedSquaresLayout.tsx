import React, { useEffect, useState } from 'react';

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
  const blueWidth = 720;
  const blueHeight = 700;

  const greenSize = 270;
  const greenSize2 = 220;

  const redSize = 120;
  const graySize = 80;

  const gapSmall = 16;
  const gapRedGreen = 40;

  const s = (value: number) => value * ratio;

  // Images
  const blueImage = '/ims/LSWRKXFNIOMES.png';

  const redImages = [
    '/ims/YGDWHUAAAUATV.png',
    '/ims/JAWLLSGBINGSW.png',
  ];

  const greenImages = [
    '/ims/EVOTQMKVLMUJO.jpeg',
    '/ims/PLIELONOOUSPM.png',
    '/ims/TYDSDCBHXJHJT.jpg',
    '/ims/QUABEWLGVUZSGss.png',
    '/ims/NHYRISMXITENV.jpeg',
  ];

  const greenImages2 = [
    '/ims/TSRCIIOLHCOVA.jpg',
    '/ims/TSRCIIOLHCOVA.jpg',
    '/ims/TSRCIIOLHCOVA.jpg',
    '/ims/ZCVCXHZVLGTXB.png',
  ];

  const grayImages = [
    '/ims/ZEALTWSDMYPPH.png',
    '/ims/REUDLQNOABVZQ.jpeg',
    '/ims/FZWLQOLTGUYFY.png',
    '/ims/CYPDOZYZGIOFZ.jpg',
    '/ims/TUPVNCZRNSOYO.jpeg',
  ];

  return (
    <div
      className="w-full min-h-screen bg-white flex flex-col items-center overflow-hidden"
      style={{
        padding: s(32),
        gap: s(16),
      }}
    >
      {/* BLUE — ALONE AT THE TOP */}
      <div
        className="rounded-2xl overflow-hidden flex-shrink-0"
        style={{
          width: s(blueWidth),
          height: s(blueHeight),
        }}
      >
        <img
          src={blueImage}
          alt=""
          className="w-full h-full object-contain"
        />
      </div>

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
          {/* TWO GREEN IN ONE ROW */}
          <div
            className="grid grid-cols-2"
            style={{
              gap: s(24),
            }}
          >
            {greenImages2.slice(2).map((image, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden flex-shrink-0"
                style={{
                  width: s(greenSize2),
                  height: s(greenSize2),
                }}
              >
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>

          {/* RED + GREEN */}
          <div
            className="flex items-start flex-shrink-0"
            style={{
              gap: s(gapRedGreen),
            }}
          >
            {/* RED STACK */}
            <div
              className="flex flex-col flex-shrink-0"
              style={{
                gap: s(gapSmall),
              }}
            >
              {redImages.map((image, index) => (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden flex-shrink-0"
                  style={{
                    width: s(redSize),
                    height: s(redSize),
                  }}
                >
                  <img
                    src={image}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>

            {/* GREEN */}
            <div
              className="rounded-2xl overflow-hidden flex-shrink-0"
              style={{
                width: s(greenSize),
                height: s(greenSize),
              }}
            >
              <img
                src={greenImages[0]}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* GRAY ROW */}
          <div
            className="flex flex-shrink-0"
            style={{
              gap: s(gapSmall),
            }}
          >
            {grayImages.map((image, index) => (
              <div
                key={index}
                className="rounded-lg overflow-hidden flex-shrink-0"
                style={{
                  width: s(graySize),
                  height: s(graySize),
                }}
              >
                <img
                  src={image}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT BENTO */}
        <div
          className="grid grid-cols-2 flex-shrink-0"
          style={{
            gap: s(gapRedGreen),
          }}
        >
          {greenImages.slice(1).map((image, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden flex-shrink-0"
              style={{
                width: s(greenSize),
                height: s(greenSize),
              }}
            >
              <img
                src={image}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
