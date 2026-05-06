const S = 8; // px per pixel cell

const B = "var(--text)";
const E = "var(--blue)";
const M = "var(--text-muted)";

type P = [number, number, string, string?];

// Robot pixel art: [col, row, color, cssClass?]
const PIXELS: P[] = [
  // Antenna
  [4, 0, E], [5, 0, E],
  [3, 1, B], [4, 1, E], [5, 1, E], [6, 1, B],
  // Head (cols 2-9, rows 2-7)
  [2,2,B],[3,2,B],[4,2,B],[5,2,B],[6,2,B],[7,2,B],[8,2,B],[9,2,B],
  [1,3,B],[2,3,B],[3,3,B],[4,3,B],[5,3,B],[6,3,B],[7,3,B],[8,3,B],[9,3,B],[10,3,B],
  [1,4,B],[2,4,E,"eye"],[3,4,E,"eye"],[4,4,B],[5,4,B],[6,4,B],[7,4,E,"eye"],[8,4,E,"eye"],[9,4,B],[10,4,B],
  [1,5,B],[2,5,B],[3,5,B],[4,5,B],[5,5,B],[6,5,B],[7,5,B],[8,5,B],[9,5,B],[10,5,B],
  [1,6,B],[2,6,M],[3,6,M],[4,6,M],[5,6,M],[6,6,M],[7,6,M],[8,6,M],[9,6,M],[10,6,B],
  [1,7,B],[2,7,B],[3,7,B],[4,7,B],[5,7,B],[6,7,B],[7,7,B],[8,7,B],[9,7,B],[10,7,B],
  // Neck
  [4,8,B],[5,8,B],[6,8,B],[7,8,B],
  // Shoulders (full width)
  [0,9,B],[1,9,B],[2,9,B],[3,9,B],[4,9,B],[5,9,B],[6,9,B],[7,9,B],[8,9,B],[9,9,B],[10,9,B],[11,9,B],
  // Arms + torso
  [0,10,B],[1,10,B],[3,10,B],[4,10,B],[5,10,B],[6,10,B],[7,10,B],[8,10,B],[10,10,B],[11,10,B],
  [0,11,B],[1,11,B],[3,11,B],[4,11,B],[5,11,B],[6,11,B],[7,11,B],[8,11,B],[10,11,B],[11,11,B],
  // Lower torso
  [3,12,B],[4,12,B],[5,12,B],[6,12,B],[7,12,B],[8,12,B],
  // Legs
  [3,13,B],[4,13,B],[7,13,B],[8,13,B],
  [3,14,B],[4,14,B],[7,14,B],[8,14,B],
];

const W = 12 * S;
const H = 15 * S;

export default function PixelAvatar() {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <style>{`
        @keyframes pa-sway {
          0%,100% { transform: rotate(0deg) translateX(0); }
          30%  { transform: rotate(-2deg) translateX(-2px); }
          70%  { transform: rotate(2deg)  translateX(2px);  }
        }
        @keyframes pa-blink {
          0%,42%,58%,100% { transform: scaleY(1); }
          50% { transform: scaleY(0.05); }
        }
        .pa-body {
          animation: pa-sway 1.8s ease-in-out infinite;
          transform-origin: ${W / 2}px ${H}px;
        }
        .pa-eye {
          animation: pa-blink 3.8s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: 50% 50%;
        }
      `}</style>
      <g className="pa-body">
        {PIXELS.map(([col, row, fill, cls], i) => (
          <rect
            key={i}
            x={col * S}
            y={row * S}
            width={S}
            height={S}
            fill={fill}
            className={cls === "eye" ? "pa-eye" : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
