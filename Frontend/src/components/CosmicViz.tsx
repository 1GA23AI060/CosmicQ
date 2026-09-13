export default function CosmicViz() {
  const bgStars = [
    [62, 78, 1.6], [418, 62, 1.1], [384, 382, 1.9], [82, 418, 1.3],
    [452, 248, 1.1], [152, 148, 1.6], [342, 442, 1.1], [102, 298, 1.3],
    [432, 148, 1.9], [52, 198, 1.1], [382, 318, 1.3], [202, 58, 1.6],
    [462, 382, 1.1], [132, 452, 1.3], [352, 98, 1.6], [478, 180, 1],
    [28, 350, 1.2], [230, 480, 1], [480, 320, 1.4], [18, 120, 1.8],
  ];

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      style={{ animation: 'float-slow 9s ease-in-out infinite' }}
    >
      <svg
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ maxWidth: '520px' }}
      >
        <defs>
          <radialGradient id="cStarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="30%" stopColor="#bfdbfe" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#3b82f6" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1e40af" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cPlanet1" cx="28%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </radialGradient>
          <radialGradient id="cPlanet2" cx="28%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#c4b5fd" />
            <stop offset="100%" stopColor="#5b21b6" />
          </radialGradient>
          <radialGradient id="cMoon" cx="28%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#92400e" />
          </radialGradient>
          <radialGradient id="cNebula1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cNebula2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>

          <filter id="cvGlowSm">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="cvGlowLg">
            <feGaussianBlur stdDeviation="18" />
          </filter>
          <filter id="cvNebula">
            <feGaussianBlur stdDeviation="32" />
          </filter>
        </defs>

        {/* Nebula glows */}
        <ellipse cx="310" cy="185" rx="165" ry="125" fill="url(#cNebula1)" filter="url(#cvNebula)" />
        <ellipse cx="165" cy="335" rx="145" ry="105" fill="url(#cNebula2)" filter="url(#cvNebula)" />
        <ellipse cx="390" cy="360" rx="100" ry="75" fill="url(#cNebula1)" filter="url(#cvNebula)" opacity="0.5" />

        {/* Background stars */}
        {bgStars.map(([cx, cy, r], i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="white"
            opacity={0.2 + (i % 5) * 0.1}
            style={{ animation: `twinkle ${2.5 + (i % 4) * 0.8}s ${(i % 7) * 0.6}s ease-in-out infinite` }}
          />
        ))}

        {/* Outer orbital ring — rx=195, ry=72, rotate 20° */}
        <ellipse
          cx="250" cy="250" rx="195" ry="72"
          fill="none"
          stroke="rgba(59,130,246,0.22)"
          strokeWidth="1"
          strokeDasharray="7 14"
          transform="rotate(20, 250, 250)"
        />

        {/* Inner orbital ring — rx=135, ry=50, rotate -20° */}
        <ellipse
          cx="250" cy="250" rx="135" ry="50"
          fill="none"
          stroke="rgba(139,92,246,0.28)"
          strokeWidth="1"
          strokeDasharray="4 9"
          transform="rotate(-20, 250, 250)"
        />

        {/* Innermost ring — rx=80, ry=28, rotate 45° */}
        <ellipse
          cx="250" cy="250" rx="80" ry="28"
          fill="none"
          stroke="rgba(255,255,255,0.09)"
          strokeWidth="0.75"
          transform="rotate(45, 250, 250)"
        />

        {/* Central star — outer halo */}
        <circle
          cx="250" cy="250" r="95"
          fill="url(#cStarGlow)"
          filter="url(#cvGlowLg)"
          style={{ animation: 'pulse-glow 4.5s ease-in-out infinite' }}
        />
        {/* Mid glow */}
        <circle cx="250" cy="250" r="56" fill="url(#cStarGlow)" opacity="0.75" />
        {/* Inner corona */}
        <circle cx="250" cy="250" r="34" fill="url(#cStarGlow)" />
        {/* Bright core */}
        <circle cx="250" cy="250" r="16" fill="white" opacity="0.96" filter="url(#cvGlowSm)" />

        {/* Planet on inner orbit (rx=135, ry=50, rotate -20°)
            Right endpoint: (377, 204), Left: (123, 296) */}
        <circle r="10" fill="url(#cPlanet1)" filter="url(#cvGlowSm)">
          <animateMotion
            dur="9s"
            repeatCount="indefinite"
            path="M 377 204 A 135 50 -20 1 1 123 296 A 135 50 -20 1 1 377 204"
          />
        </circle>

        {/* Planet on outer orbit (rx=195, ry=72, rotate 20°)
            Right endpoint: (433, 317), Left: (67, 183) */}
        <circle r="7.5" fill="url(#cPlanet2)" filter="url(#cvGlowSm)">
          <animateMotion
            dur="17s"
            repeatCount="indefinite"
            path="M 433 317 A 195 72 20 1 1 67 183 A 195 72 20 1 1 433 317"
          />
        </circle>

        {/* Moon on innermost ring (rx=80, ry=28, rotate 45°)
            Right endpoint: (307, 307), Left: (193, 193) */}
        <circle r="4.5" fill="url(#cMoon)">
          <animateMotion
            dur="5.5s"
            repeatCount="indefinite"
            path="M 307 307 A 80 28 45 1 1 193 193 A 80 28 45 1 1 307 307"
          />
        </circle>

        {/* Floating particles */}
        {[
          [348, 162, 2.5], [172, 302, 2], [384, 342, 2], [132, 184, 1.5], [422, 294, 2],
          [290, 438, 1.5], [460, 210, 1.5], [88, 262, 2],
        ].map(([x, y, r], i) => (
          <circle
            key={i}
            cx={x} cy={y} r={r}
            fill="rgba(147,197,253,0.55)"
            style={{ animation: `twinkle ${3.5 + i * 0.7}s ${i * 0.9}s ease-in-out infinite` }}
          />
        ))}
      </svg>
    </div>
  );
}
