import React, { useEffect, useState } from 'react';

export default function ExactSizeSquaresLayout() {
  const DESIGN_WIDTH = 1500;

  const getRatio = () =>
    Math.min((window.innerWidth - 10) / DESIGN_WIDTH, 1);

  const [ratio, setRatio] = useState(getRatio);

  useEffect(() => {
    const handleResize = () => {
      setRatio(getRatio());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Original design dimensions
  const blueWidth = 560;
  const blueHeight = 580;

  const greenSize = 350;
  const redSize = 170;
  const graySize = 100;

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
    '/ims/QUABEWLGVUZSGss.png',
    '/ims/NHYRISMXITENV.jpeg',
    '/ims/EVOTQMKVLMUJO.jpeg',
    '/ims/PLIELONOOUSPM.png',
    '/ims/TYDSDCBHXJHJT.jpg',
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
      className="w-full min-h-screen bg-white flex items-center justify-center overflow-hidden"
      style={{
        padding: s(32),
      }}
    >
      <div
        className="flex items-start flex-shrink-0"
        style={{
          gap: s(gapSmall),
        }}
      >
        {/* LEFT COLUMN */}
        <div
          className="flex flex-col flex-shrink-0"
          style={{
            gap: s(gapSmall),
          }}
        >
          {/* BLUE */}
          <div
            className="rounded-2xl overflow-hidden  flex-shrink-0"
            style={{
              width: s(blueWidth),
              height: s(blueHeight),
            }}
          >
            <img
              src={blueImage}
              alt=""
              className="w-full h-full object-contain "
            />
          </div>

          {/* BOTTOM */}
          <div
            className="flex items-start flex-shrink-0"
            style={{
              gap: s(gapSmall),
            }}
          >
            <div
              className="flex flex-col flex-shrink-0"
              style={{
                gap: s(24),
              }}
            >
              {/* RED + GREEN */}
              <div
                className="flex flex-row items-start flex-shrink-0"
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
                        className="w-full h-full object-contain "
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
                    className="w-full h-full object-cover"
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
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div
          className="grid grid-cols-2 flex-shrink-0"
          style={{
            gap: s(gapSmall),
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
                className="w-full h-full object-contain "
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}