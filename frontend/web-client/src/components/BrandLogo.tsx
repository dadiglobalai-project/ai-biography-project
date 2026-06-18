import React from 'react';

interface BrandLogoProps {
  variant?: 'hero' | 'mobile';
  className?: string;
}

export default function BrandLogo({ variant = 'hero', className = '' }: BrandLogoProps) {
  const isHero = variant === 'hero';

  // Base colors
  const goldColor = '#C5A880';
  const textColorClass = isHero ? 'text-white' : 'text-legacy-navy';
  const defaultSizeClass = isHero ? 'w-full max-w-[460px]' : 'w-full max-w-[280px] sm:max-w-[320px]';

  // Center of the main dandelion head
  const cx = 115;
  const cy = 125;

  // Beautifully dense and perfectly round distribution of seed filaments covering the complete 360 degrees
  const seedAngles = Array.from({ length: 56 }, (_, i) => (i * 360) / 56);

  // Blowing seeds drifting beautifully across the wordmark to the top right
  const blowingSeeds = [
    { x: 185, y: 110, angle: -48, scale: 0.95 },
    { x: 220, y: 95, angle: -44, scale: 0.9 },
    { x: 245, y: 125, angle: -52, scale: 0.8 },
    { x: 285, y: 88, angle: -46, scale: 0.82 },
    { x: 325, y: 105, angle: -42, scale: 0.75 },
    { x: 345, y: 72, angle: -45, scale: 0.7 },
    { x: 405, y: 82, angle: -40, scale: 0.62 },
    { x: 450, y: 64, angle: -38, scale: 0.55 },
  ];

  // Star spark database along with the flying seeds
  const goldStars = [
    { x: 175, y: 145, size: 7.5, type: '4-point' }, // sparkle near text start
    { x: 210, y: 120, size: 5.5, type: '4-point' }, 
    { x: 275, y: 102, size: 6.0, type: '4-point' },
    { x: 335, y: 82, size: 6.5, type: '4-point' },
    { x: 380, y: 68, size: 8.0, type: '4-point' },
    { x: 420, y: 98, size: 5.0, type: '4-point' },
    { x: 465, y: 78, size: 5.5, type: '4-point' },
    { x: 485, y: 48, size: 15.0, type: '5-point' }, // The preeminent 5-point guiding success star
    { x: 430, y: 38, size: 7.0, type: '4-point' },
    { x: 350, y: 52, size: 5.0, type: '4-point' }
  ];

  // Tiny gold sparkles clustered near the seed receptacle core
  const goldSparks = [
    { dx: 14, dy: -8, r: 1.1 },
    { dx: -18, dy: -12, r: 0.9 },
    { dx: 6, dy: 16, r: 1.2 },
    { dx: -12, dy: 18, r: 1.0 },
    { dx: 22, dy: 4, r: 0.8 },
    { dx: 5, dy: -20, r: 1.0 },
    { dx: -22, dy: -2, r: 1.1 },
    { dx: 10, dy: -15, r: 0.8 },
  ];

  // Helper to render beautiful 4-point flare
  const renderFourPointStar = (key: string, x: number, y: number, r: number, fill: string) => (
    <path
      key={key}
      d={`M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} Q ${x} ${y} ${x - r} ${y} Z`}
      fill={fill}
    />
  );

  // Helper to render standard 5-point success star
  const renderFivePointStar = (key: string, x: number, y: number, r: number, fill: string) => {
    const points = [];
    const innerRadius = r / 2.3;
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const radius = i % 2 === 0 ? r : innerRadius;
      points.push(`${x + radius * Math.cos(angle)},${y + radius * Math.sin(angle)}`);
    }
    return (
      <polygon
        key={key}
        points={points.join(" ")}
        fill={fill}
      />
    );
  };

  return (
    <div className={`select-none ${defaultSizeClass} ${className}`}>
      <svg
        viewBox="0 0 600 240"
        fill="none"
        className={`w-full h-auto ${textColorClass} transition-colors duration-300`}
        id="xinghuoji-logo-svg"
      >
        {/* Curved Stem */}
        <path
          d="M 115 125 Q 102 185 92 235"
          stroke="currentColor"
          strokeWidth="2.8"
          strokeLinecap="round"
          className="opacity-90"
        />

        {/* Center Golden Receptacle Core */}
        <circle cx={cx} cy={cy} r="4.5" fill={goldColor} />
        <circle cx={cx} cy={cy} r="2.2" fill={isHero ? '#0e172e' : '#ffffff'} />

        {/* Golden sparkles clustered at the head center */}
        {goldSparks.map((spark, idx) => (
          <circle
            key={`sparkle-${idx}`}
            cx={cx + spark.dx}
            cy={cy + spark.dy}
            r={spark.r}
            fill={goldColor}
            opacity="0.85"
          />
        ))}

        {/* Main Seed Head and radiating filaments */}
        {seedAngles.map((angle, index) => {
          const rad = (angle * Math.PI) / 180;
          const length = 40 + (index % 4) * 3;
          const endX = cx + length * Math.cos(rad);
          const endY = cy + length * Math.sin(rad);

          // Pappus parachute branches
          const leftRad = rad - 0.22;
          const midLeftRad = rad - 0.08;
          const midRightRad = rad + 0.08;
          const rightRad = rad + 0.22;
          const branchLen = 6;

          return (
            <g key={`seed-${index}`} className="opacity-80">
              {/* Seed Stalk filament */}
              <line
                x1={cx}
                y1={cy}
                x2={endX}
                y2={endY}
                stroke="currentColor"
                strokeWidth="0.65"
              />
              
              {/* Golden spark base seed dot */}
              <circle
                cx={cx + 6 * Math.cos(rad)}
                cy={cy + 6 * Math.sin(rad)}
                r="0.8"
                fill={goldColor}
              />

              {/* Parachute branch lines */}
              <line
                x1={endX}
                y1={endY}
                x2={endX + branchLen * Math.cos(leftRad)}
                y2={endY + branchLen * Math.sin(leftRad)}
                stroke="currentColor"
                strokeWidth="0.45"
              />
              <line
                x1={endX}
                y1={endY}
                x2={endX + (branchLen + 1.5) * Math.cos(midLeftRad)}
                y2={endY + (branchLen + 1.5) * Math.sin(midLeftRad)}
                stroke="currentColor"
                strokeWidth="0.45"
              />
              <line
                x1={endX}
                y1={endY}
                x2={endX + (branchLen + 1.5) * Math.cos(midRightRad)}
                y2={endY + (branchLen + 1.5) * Math.sin(midRightRad)}
                stroke="currentColor"
                strokeWidth="0.45"
              />
              <line
                x1={endX}
                y1={endY}
                x2={endX + branchLen * Math.cos(rightRad)}
                y2={endY + branchLen * Math.sin(rightRad)}
                stroke="currentColor"
                strokeWidth="0.45"
              />
            </g>
          );
        })}

        {/* Flying detached seeds crossing to the upper right */}
        {blowingSeeds.map((seed, index) => {
          const sRad = (seed.angle * Math.PI) / 180;
          const tx = seed.x + (32 * seed.scale) * Math.cos(sRad);
          const ty = seed.y + (32 * seed.scale) * Math.sin(sRad);
          
          const sLeftRad = sRad - 0.22;
          const sMidLeftRad = sRad - 0.08;
          const sMidRightRad = sRad + 0.08;
          const sRightRad = sRad + 0.22;
          const sBranchLen = 7 * seed.scale;

          return (
            <g key={`detached-seed-${index}`} className="opacity-90">
              {/* Seed core */}
              <circle
                cx={seed.x}
                cy={seed.y}
                r={1.25 * seed.scale}
                fill={goldColor}
              />
              
              {/* Seed stalk */}
              <line
                x1={seed.x}
                y1={seed.y}
                x2={tx}
                y2={ty}
                stroke="currentColor"
                strokeWidth={0.7 * seed.scale}
              />

              {/* Parachute branch lines */}
              <line
                x1={tx}
                y1={ty}
                x2={tx + sBranchLen * Math.cos(sLeftRad)}
                y2={ty + sBranchLen * Math.sin(sLeftRad)}
                stroke="currentColor"
                strokeWidth={0.5 * seed.scale}
              />
              <line
                x1={tx}
                y1={ty}
                x2={tx + (sBranchLen + 1.8) * Math.cos(sMidLeftRad)}
                y2={ty + (sBranchLen + 1.8) * Math.sin(sMidLeftRad)}
                stroke="currentColor"
                strokeWidth={0.5 * seed.scale}
              />
              <line
                x1={tx}
                y1={ty}
                x2={tx + (sBranchLen + 1.8) * Math.cos(sMidRightRad)}
                y2={ty + (sBranchLen + 1.8) * Math.sin(sMidRightRad)}
                stroke="currentColor"
                strokeWidth={0.5 * seed.scale}
              />
              <line
                x1={tx}
                y1={ty}
                x2={tx + sBranchLen * Math.cos(sRightRad)}
                y2={ty + sBranchLen * Math.sin(sRightRad)}
                stroke="currentColor"
                strokeWidth={0.5 * seed.scale}
              />
            </g>
          );
        })}

        {/* Glowing gold stars */}
        {goldStars.map((star, idx) => {
          const key = `star-${idx}`;
          return star.type === '5-point'
            ? renderFivePointStar(key, star.x, star.y, star.size, goldColor)
            : renderFourPointStar(key, star.x, star.y, star.size, goldColor);
        })}

        {/* Wordmark "XINGHUOJI" in serif display */}
        <text
          x="385"
          y="158"
          textAnchor="middle"
          fontFamily="'Cinzel', serif"
          fontWeight="bold"
          fontSize="44"
          letterSpacing="0.28em"
          fill="currentColor"
          id="brand-wordmark-text"
        >
          XINGHUOJI
        </text>

        {/* Elegant divider lines with centered 4-pointed diamond star */}
        <line
          x1="210"
          y1="184"
          x2="365"
          y2="184"
          stroke={goldColor}
          strokeWidth="1.2"
          opacity="0.8"
        />
        {renderFourPointStar("divider-star", 385, 184, 5.5, goldColor)}
        <line
          x1="405"
          y1="184"
          x2="560"
          y2="184"
          stroke={goldColor}
          strokeWidth="1.2"
          opacity="0.8"
        />

        {/* Subtitle "AI BIOGRAPHY & DIGITAL LEGACY PLATFORM" */}
        <text
          x="385"
          y="214"
          textAnchor="middle"
          fontFamily="'Inter', sans-serif"
          fontWeight="500"
          fontSize="11.5"
          letterSpacing="0.22em"
          fill={goldColor}
          opacity="0.9"
          id="brand-subtitle-text"
        >
          AI BIOGRAPHY & DIGITAL LEGACY PLATFORM
        </text>
      </svg>
    </div>
  );
}
