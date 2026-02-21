import React from 'react';

/**
 * Horizontal Cribbage Board - Full 120 holes per player
 * 3 rows × 40 holes = 120 per player
 */

const HOLE_R = 2.5;
const HOLE_SPACING = 10;
const GROUP_GAP = 8;
const ROW_SPACING = 18;
const TRACK_GAP = 30;
const PAD_X = 40;
const PAD_Y = 40;

// 40 holes = 8 groups of 5
const GROUPS = 8;
const W = PAD_X * 2 + GROUPS * 5 * HOLE_SPACING + (GROUPS - 1) * GROUP_GAP;
const H = PAD_Y * 2 + 5 * ROW_SPACING + TRACK_GAP;

function pos(idx, player) {
  const row = Math.floor((idx - 1) / 40);
  const p = (idx - 1) % 40;
  const g = Math.floor(p / 5);
  const o = p % 5;
  const xOff = g * (5 * HOLE_SPACING + GROUP_GAP) + o * HOLE_SPACING;
  const x = row === 1 ? W - PAD_X - xOff : PAD_X + xOff;
  const y = PAD_Y + (player === 1 ? row : row + 3) * ROW_SPACING + (player === 2 ? TRACK_GAP : 0);
  return { x, y };
}

function Peg({ x, y, c, f }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <ellipse cx="0" cy="2" rx="3" ry="1.5" fill="rgba(0,0,0,0.3)" />
      <path d="M-2 1 L-2-6 A2 2 0 0 1 2-6 L2 1 A2 1.5 0 0 1 -2 1" fill={c} stroke="#111" strokeWidth="0.5" />
      <ellipse cx="0" cy="-6" rx="2" ry="1" fill="rgba(255,255,255,0.3)" />
      {f && <circle cx="0" cy="-2" r="4" fill="none" stroke={c} strokeWidth="0.8" opacity="0.5">
        <animate attributeName="r" values="3;6;3" dur="1.5s" repeatCount="indefinite" />
      </circle>}
    </g>
  );
}

export default function PegTrack({ p1 = 0, p1b = 0, p2 = 0, p2b = 0 }) {
  const holes = [];
  for (let i = 1; i <= 120; i++) {
    for (let pl = 1; pl <= 2; pl++) {
      const { x, y } = pos(i, pl);
      holes.push(
        <g key={`h${pl}-${i}`}>
          <circle cx={x} cy={y} r={HOLE_R} fill="#0a0604" />
          {i % 5 === 0 && <text x={x} y={y - 5} fontSize="5" fill="#a08060" textAnchor="middle">{i}</text>}
        </g>
      );
    }
  }

  const a = Math.max(1, Math.min(120, p1)), ab = Math.max(1, Math.min(120, p1b));
  const b = Math.max(1, Math.min(120, p2)), bb = Math.max(1, Math.min(120, p2b));

  return (
    <div style={{ width: '100%', overflowX: 'auto', background: '#071510', padding: '8px', borderRadius: '8px' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: W + 'px', display: 'block' }}>
        <defs>
          <linearGradient id="w" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#5a3a1a" />
            <stop offset="1" stopColor="#3a2510" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width={W - 8} height={H - 8} rx="8" fill="url(#w)" stroke="#2a1a0a" strokeWidth="2" />
        
        <text x={PAD_X} y={PAD_Y - 12} fill="#fbbf24" fontSize="10" fontWeight="bold">P1</text>
        <text x={PAD_X} y={PAD_Y + 3 * ROW_SPACING + TRACK_GAP - 12} fill="#fbbf24" fontSize="10" fontWeight="bold">P2</text>
        
        <text x={PAD_X - 25} y={PAD_Y + 4} fill="#fbbf24" fontSize="7" fontWeight="bold">START</text>
        <text x={PAD_X - 25} y={PAD_Y + 2 * ROW_SPACING + 4} fill="#fbbf24" fontSize="7" fontWeight="bold">FINISH</text>
        <text x={PAD_X - 25} y={PAD_Y + 3 * ROW_SPACING + TRACK_GAP + 4} fill="#fbbf24" fontSize="7" fontWeight="bold">START</text>
        <text x={PAD_X - 25} y={PAD_Y + 5 * ROW_SPACING + TRACK_GAP + 4} fill="#fbbf24" fontSize="7" fontWeight="bold">FINISH</text>
        
        {holes}
        
        {p1 > 0 && <Peg x={pos(a, 1).x} y={pos(a, 1).y} c="#fef3c7" f={true} />}
        {p1b > 0 && <Peg x={pos(ab, 1).x} y={pos(ab, 1).y} c="#fef3c7" f={false} />}
        {p2 > 0 && <Peg x={pos(b, 2).x} y={pos(b, 2).y} c="#c94a1a" f={true} />}
        {p2b > 0 && <Peg x={pos(bb, 2).x} y={pos(bb, 2).y} c="#c94a1a" f={false} />}
      </svg>
    </div>
  );
}
