import React from 'react';

interface BrandLogoProps {
  variant?: 'hero' | 'mobile';
  className?: string;
}

export default function BrandLogo({ variant = 'hero', className = '' }: BrandLogoProps) {
  const isHero = variant === 'hero';

  // Exact HEX Colors from the image
  const goldColor = '#CCA355'; // Beautiful golden shine
  const navyColor = '#0A1C36'; // Rich deep brand navy
  
  // Adaptive brand colors based on light vs dark display background
  const mainColor = isHero ? '#F8F6F0' : navyColor; 

  // Center of the main dandelion head
  const cx = 200;
  const cy = 190;

  // Generate 52 perfectly round seed filaments covering the complete 360-degree range
  const seedAngles = Array.from({ length: 52 }, (_, i) => (i * 360) / 52);

  // Flying seeds drifting beautifully in a curved trajectory to the top-right
  const blowingSeeds = [
    { x: 320, y: 175, angle: -42, scale: 0.95 },
    { x: 380, y: 140, angle: -46, scale: 0.9 },
    { x: 420, y: 190, angle: -52, scale: 0.8 },
    { x: 490, y: 130, angle: -44, scale: 0.85 },
    { x: 550, y: 160, angle: -40, scale: 0.72 },
    { x: 580, y: 110, angle: -45, scale: 0.78 },
    { x: 670, y: 125, angle: -38, scale: 0.65 },
    { x: 740, y: 95,  angle: -42, scale: 0.58 },
  ];

  // Gold stars matching the layout of the reference image
  const goldStars = [
    { x: 335, y: 235, size: 7.5, type: '4-point' }, // spark near bottom of drift
    { x: 390, y: 195, size: 6.0, type: '4-point' }, 
    { x: 495, y: 165, size: 9.0, type: '4-point' }, // large star in mid drift
    { x: 595, y: 135, size: 6.5, type: '4-point' },
    { x: 665, y: 110, size: 8.5, type: '4-point' },
    { x: 735, y: 138, size: 5.5, type: '4-point' },
    { x: 810, y: 112, size: 6.0, type: '4-point' },
    { x: 830, y: 72,  size: 19.0, type: '5-point' }, // Preeminent large 5-point star guiding the legacy
    { x: 750, y: 55,  size: 5.5, type: '4-point' },
    { x: 620, y: 78,  size: 5.0, type: '4-point' },
  ];

  // Tiny golden core sparks clustered intimately around the receptacle center
  const coreSparks = [
    { dx: 18, dy: -12, r: 1.3 },
    { dx: -22, dy: -15, r: 1.1 },
    { dx: 8, dy: 24, r: 1.4 },
    { dx: -15, dy: 22, r: 1.2 },
    { dx: 30, dy: 6, r: 0.9 },
    { dx: 6, dy: -28, r: 1.1 },
    { dx: -30, dy: -3, r: 1.3 },
    { dx: 14, dy: -22, r: 0.9 },
    { dx: 45, dy: -45, r: 1.2 },  // escaping seed base spark
    { dx: -45, dy: 45, r: 1.0 },
  ];

  // Render a 4-point star (sparkle diamond flare)
  const renderFourPointStar = (key: string, x: number, y: number, r: number, fill: string) => (
    <path
      key={key}
      d={`M ${x} ${y - r} Q ${x} ${y} ${x + r} ${y} Q ${x} ${y} ${x} ${y + r} Q ${x} ${y} ${x - r} ${y} Z`}
      fill={fill}
    />
  );

  // Render a beautiful, geometrically balanced 5-point star
  const renderFivePointStar = (key: string, x: number, y: number, r: number, fill: string) => {
    const points = [];
    const innerRadius = r / 2.35;
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
    <div className={`select-none ${className}`}>
      <svg
        viewBox="0 0 1000 380"
        fill="none"
        className="w-full h-auto transition-colors duration-300"
        id="xinghuoji-exact-logo"
      >
        {/* Curved Flowing Dandelion Stem */}
        <path
          d="M 200 190 Q 180 280 167 362"
          stroke={mainColor}
          strokeWidth="4.2"
          strokeLinecap="round"
          className="opacity-95"
        />

        {/* Golden Receptacle Core */}
        <circle cx={cx} cy={cy} r="6.5" fill={goldColor} />
        <circle cx={cx} cy={cy} r="3.0" fill={isHero ? '#0D1625' : '#FFFFFF'} />

        {/* Gold sparks radiating from core */}
        {coreSparks.map((spark, idx) => (
          <circle
            key={`core-spark-${idx}`}
            cx={cx + spark.dx}
            cy={cy + spark.dy}
            r={spark.r}
            fill={goldColor}
            opacity="0.85"
          />
        ))}

        {/* Main Perfectly Dense Round Seed Head filaments */}
        {seedAngles.map((angle, index) => {
          const rad = (angle * Math.PI) / 180;
          const length = 68 + (index % 5) * 4; // micro-variation for organic texture
          const endX = cx + length * Math.cos(rad);
          const endY = cy + length * Math.sin(rad);

          // Pappus fluffy fork branches
          const leftRad = rad - 0.24;
          const midLeftRad = rad - 0.08;
          const midRightRad = rad + 0.08;
          const rightRad = rad + 0.24;
          const branchLen = 9;

          return (
            <g key={`main-head-seed-${index}`} className="opacity-80">
              {/* Radial stalk */}
              <line
                x1={cx}
                y1={cy}
                x2={endX}
                y2={endY}
                stroke={mainColor}
                strokeWidth="0.9"
              />
              {/* Micro-spark base node */}
              <circle
                cx={cx + 9 * Math.cos(rad)}
                cy={cy + 9 * Math.sin(rad)}
                r="1.1"
                fill={goldColor}
              />
              {/* Pappus branching details */}
              <line
                x1={endX}
                y1={endY}
                x2={endX + branchLen * Math.cos(leftRad)}
                y2={endY + branchLen * Math.sin(leftRad)}
                stroke={mainColor}
                strokeWidth="0.65"
              />
              <line
                x1={endX}
                y1={endY}
                x2={endX + (branchLen + 2) * Math.cos(midLeftRad)}
                y2={endY + (branchLen + 2) * Math.sin(midLeftRad)}
                stroke={mainColor}
                strokeWidth="0.65"
              />
              <line
                x1={endX}
                y1={endY}
                x2={endX + (branchLen + 2) * Math.cos(midRightRad)}
                y2={endY + (branchLen + 2) * Math.sin(midRightRad)}
                stroke={mainColor}
                strokeWidth="0.65"
              />
              <line
                x1={endX}
                y1={endY}
                x2={endX + branchLen * Math.cos(rightRad)}
                y2={endY + branchLen * Math.sin(rightRad)}
                stroke={mainColor}
                strokeWidth="0.65"
              />
            </g>
          );
        })}

        {/* Escaping seeds flowing towards wordmark and sky */}
        {blowingSeeds.map((seed, index) => {
          const sRad = (seed.angle * Math.PI) / 180;
          const tx = seed.x + (46 * seed.scale) * Math.cos(sRad);
          const ty = seed.y + (46 * seed.scale) * Math.sin(sRad);
          
          const sLeftRad = sRad - 0.24;
          const sMidLeftRad = sRad - 0.08;
          const sMidRightRad = sRad + 0.08;
          const sRightRad = sRad + 0.24;
          const sBranchLen = 10 * seed.scale;

          return (
            <g key={`flying-seed-${index}`} className="opacity-95">
              <circle
                cx={seed.x}
                cy={seed.y}
                r={1.8 * seed.scale}
                fill={goldColor}
              />
              <line
                x1={seed.x}
                y1={seed.y}
                x2={tx}
                y2={ty}
                stroke={mainColor}
                strokeWidth={1.05 * seed.scale}
              />
              <line
                x1={tx}
                y1={ty}
                x2={tx + sBranchLen * Math.cos(sLeftRad)}
                y2={ty + sBranchLen * Math.sin(sLeftRad)}
                stroke={mainColor}
                strokeWidth={0.7 * seed.scale}
              />
              <line
                x1={tx}
                y1={ty}
                x2={tx + (sBranchLen + 2.5) * Math.cos(sMidLeftRad)}
                y2={ty + (sBranchLen + 2.5) * Math.sin(sMidLeftRad)}
                stroke={mainColor}
                strokeWidth={0.7 * seed.scale}
              />
              <line
                x1={tx}
                y1={ty}
                x2={tx + (sBranchLen + 2.5) * Math.cos(sMidRightRad)}
                y2={ty + (sBranchLen + 2.5) * Math.sin(sMidRightRad)}
                stroke={mainColor}
                strokeWidth={0.7 * seed.scale}
              />
              <line
                x1={tx}
                y1={ty}
                x2={tx + sBranchLen * Math.cos(sRightRad)}
                y2={ty + sBranchLen * Math.sin(sRightRad)}
                stroke={mainColor}
                strokeWidth={0.7 * seed.scale}
              />
            </g>
          );
        })}

        {/* Sparkling celestial stars following the blowing path */}
        {goldStars.map((star, idx) => {
          const key = `star-glow-${idx}`;
          return star.type === '5-point'
            ? renderFivePointStar(key, star.x, star.y, star.size, goldColor)
            : renderFourPointStar(key, star.x, star.y, star.size, goldColor);
        })}

        {/* Wordmark "XINGHUOJI" matching elegant Display typography */}
        <text
          x="578"
          y="242"
          textAnchor="middle"
          fontFamily="'Cinzel', 'Playfair Display', serif"
          fontWeight="bold"
          fontSize="68"
          letterSpacing="0.22em"
          fill={mainColor}
          id="exact-wordmark-text"
        >
          XINGHUOJI
        </text>

        {/* Elegant divider horizontal bars with centered gold 4-point star */}
        <line
          x1="300"
          y1="282"
          x2="548"
          y2="282"
          stroke={goldColor}
          strokeWidth="1.8"
          opacity="0.85"
        />
        {renderFourPointStar("divider-center-gold-star", 578, 282, 8.5, goldColor)}
        <line
          x1="608"
          y1="282"
          x2="856"
          y2="282"
          stroke={goldColor}
          strokeWidth="1.8"
          opacity="0.85"
        />

        {/* Subtitle "AI BIOGRAPHY & DIGITAL LEGACY PLATFORM" */}
        <text
          x="578"
          y="328"
          textAnchor="middle"
          fontFamily="'Inter', sans-serif"
          fontWeight="500"
          fontSize="17.2"
          letterSpacing="0.22em"
          fill={goldColor}
          opacity="0.95"
          id="exact-subtitle-text"
        >
          AI BIOGRAPHY & DIGITAL LEGACY PLATFORM
        </text>
      </svg>
    </div>
  );
}
