import React from 'react';

export default function Watermark() {
  // Center of the main flower head
  const cx = 42;
  const cy = 54;
  
  // Intact seeds radiating outwards (primarily to the left, top, and bottom)
  const seedAngles = [
    -180, -170, -160, -150, -140, -130, -120, -110, -100, -90, -80, -70,
    185, 175, 165, 155, 145, 135, 125, 115, 105, 95, 85, 75,
    -165, -145, -125, -105, 165, 145, 125, 105,
    -155, -135, -115, 155, 135, 115
  ];

  // Blowing detached seeds drifting beautifully towards the upper right
  const blowingSeeds = [
    { startX: 58, startY: 42, endX: 66, endY: 33, scale: 0.9, angle: -45 },
    { startX: 68, startY: 48, endX: 76, endY: 39, scale: 0.8, angle: -42 },
    { startX: 70, startY: 32, endX: 78, endY: 22, scale: 0.95, angle: -50 },
    { startX: 78, startY: 43, endX: 86, endY: 34, scale: 0.85, angle: -40 },
    { startX: 84, startY: 24, endX: 92, endY: 14, scale: 1.0, angle: -48 },
    { startX: 88, startY: 38, endX: 96, endY: 29, scale: 0.75, angle: -45 },
  ];

  // Gold stars scattered dynamically along with the flying seeds
  const goldStars = [
    { x: 92, y: 15, size: 4.8 }, // Prominent big destiny star
    { x: 80, y: 24, size: 2.2 },
    { x: 74, y: 12, size: 2.0 },
    { x: 67, y: 29, size: 1.5 },
    { x: 60, y: 18, size: 1.8 },
    { x: 53, y: 39, size: 1.6 },
    { x: 71, y: 36, size: 1.2 },
    { x: 81, y: 34, size: 1.4 },
  ];

  // Oval golden accents at the flower receptacle core
  const corePetals = [
    { r: 2.4, a: -150 }, { r: 2.6, a: -120 }, { r: 2.5, a: -90 },
    { r: 2.4, a: -60 }, { r: 2.6, a: 150 }, { r: 2.5, a: 120 },
    { r: 2.4, a: 90 }, { r: 2.3, a: 60 }
  ];

  return (
    <div className="absolute bottom-2 right-5 sm:right-8 pointer-events-auto cursor-help opacity-[0.04] sm:opacity-[0.06] md:opacity-[0.08] lg:opacity-[0.10] hover:opacity-100 active:opacity-100 w-[75px] sm:w-[95px] md:w-[120px] h-[75px] sm:h-[95px] md:h-[120px] select-none transition-all duration-300 ease-out transform hover:scale-110 active:scale-95" title="Xinghuoji: AI Biography & Digital Legacy Platform">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        className="w-full h-full text-legacy-navy hover:text-legacy-navy transition-colors duration-300"
      >
        {/* Curved stem of the main dandelion */}
        <path
          d="M 42 54 Q 38 76 32 100"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Solid/Gold Seed Receptacle Core */}
        <circle cx={cx} cy={cy} r="3.2" className="text-legacy-gold fill-current animate-pulse" />
        <circle cx={cx} cy={cy} r="1.5" className="text-legacy-navy fill-current" />

        {/* Interactive core petals matching the design */}
        {corePetals.map((p, i) => {
          const rad = (p.a * Math.PI) / 180;
          const px = cx + p.r * Math.cos(rad);
          const py = cy + p.r * Math.sin(rad);
          return (
            <ellipse
              key={`petal-${i}`}
              cx={px}
              cy={py}
              rx="0.9"
              ry="1.8"
              transform={`rotate(${p.a + 90}, ${px}, ${py})`}
              className="text-legacy-gold fill-current"
            />
          );
        })}

        {/* Intact seeds radiating outwards */}
        {seedAngles.map((angle, index) => {
          const rad = (angle * Math.PI) / 180;
          const length = 16 + (index % 3) * 2; // Varying lengths for dynamic look
          const endX = cx + length * Math.cos(rad);
          const endY = cy + length * Math.sin(rad);

          return (
            <g key={`intact-${index}`}>
              {/* Seed stalk */}
              <line
                x1={cx}
                y1={cy}
                x2={endX}
                y2={endY}
                stroke="currentColor"
                strokeWidth="0.5"
              />
              {/* Golden tiny seed base accent */}
              <circle
                cx={cx + 3 * Math.cos(rad)}
                cy={cy + 3 * Math.sin(rad)}
                r="0.8"
                className="text-legacy-gold fill-current"
              />
              {/* Radial fluff head at the tip */}
              <path
                d={`M ${endX - 3.5 * Math.sin(rad)} ${endY + 3.5 * Math.cos(rad)} 
                    Q ${endX} ${endY} 
                    ${endX + 3.5 * Math.sin(rad)} ${endY - 3.5 * Math.cos(rad)}`}
                stroke="currentColor"
                strokeWidth="0.45"
              />
              <path
                d={`M ${endX - 2.5 * Math.cos(rad + 0.4)} ${endY - 2.5 * Math.sin(rad + 0.4)} 
                    L ${endX} ${endY} 
                    L ${endX - 2.5 * Math.cos(rad - 0.4)} ${endY - 2.5 * Math.sin(rad - 0.4)}`}
                stroke="currentColor"
                strokeWidth="0.4"
              />
            </g>
          );
        })}

        {/* Detached seeds in flight */}
        {blowingSeeds.map((seed, index) => {
          const rad = (seed.angle * Math.PI) / 180;
          const { startX, startY, endX, endY } = seed;

          return (
            <g key={`blowing-${index}`} style={{ transformOrigin: `${startX}px ${startY}px` }}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="currentColor"
                strokeWidth="0.55"
              />
              {/* Tiny gold dot core */}
              <circle cx={startX} cy={startY} r="0.6" className="text-legacy-gold fill-current" />
              {/* Fluff layout at the end of the stem */}
              <path
                d={`M ${endX - (3 * seed.scale) * Math.sin(rad)} ${endY + (3 * seed.scale) * Math.cos(rad)} 
                    Q ${endX} ${endY} 
                    ${endX + (3 * seed.scale) * Math.sin(rad)} ${endY - (3 * seed.scale) * Math.cos(rad)}`}
                stroke="currentColor"
                strokeWidth="0.4"
              />
              <path
                d={`M ${endX - (2.5 * seed.scale) * Math.cos(rad + 0.4)} ${endY - (2.5 * seed.scale) * Math.sin(rad + 0.4)} 
                    L ${endX} ${endY} 
                    L ${endX - (2.5 * seed.scale) * Math.cos(rad - 0.4)} ${endY - (2.5 * seed.scale) * Math.sin(rad - 0.4)}`}
                stroke="currentColor"
                strokeWidth="0.35"
              />
            </g>
          );
        })}

        {/* Beautiful golden legacy stars in sky */}
        {goldStars.map((star, index) => {
          // Generates star polygon path points dynamically for pixel accuracy
          const points = [];
          const outerRadius = star.size;
          const innerRadius = star.size / 2.3;
          for (let i = 0; i < 10; i++) {
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            points.push(`${star.x + r * Math.cos(angle)},${star.y + r * Math.sin(angle)}`);
          }

          return (
            <polygon
              key={`star-${index}`}
              points={points.join(" ")}
              className="text-legacy-gold fill-current"
            />
          );
        })}
      </svg>
    </div>
  );
}
