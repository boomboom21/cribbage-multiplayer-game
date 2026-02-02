import React from 'react';

export default function PegTrack({ pegPosition = 0, playerColor = '#3b82f6', playerName = 'P' }) {
  // Create 121 hole positions (0-120)
  const holes = Array.from({ length: 121 }, (_, i) => i);

  // Calculate hole positions in a 4-row layout (30 holes per row)
  const holesPerRow = 30;
  const holeRadius = 6;
  const holeSpacing = 20;
  const rowHeight = 40;
  const padding = 20;

  const getHolePosition = (index) => {
    const row = Math.floor(index / holesPerRow);
    const col = index % holesPerRow;
    const x = padding + col * holeSpacing;
    const y = padding + row * rowHeight;
    return { x, y };
  };

  const currentPos = getHolePosition(pegPosition);
  const width = padding * 2 + holesPerRow * holeSpacing;
  const height = padding * 2 + 4 * rowHeight;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{
        width: '100%',
        height: '120px',
        background: '#2a2a2a',
        borderRadius: '6px',
        border: '1px solid #444',
      }}
    >
      {/* Draw all holes */}
      {holes.map((index) => {
        const pos = getHolePosition(index);
        return (
          <circle
            key={`hole-${index}`}
            cx={pos.x}
            cy={pos.y}
            r={holeRadius}
            fill={index === pegPosition ? 'transparent' : '#444'}
            stroke={index === pegPosition ? playerColor : '#555'}
            strokeWidth={1}
          />
        );
      })}

      {/* Draw peg at current position */}
      <g key={`peg-${pegPosition}`}>
        <circle
          cx={currentPos.x}
          cy={currentPos.y}
          r={holeRadius + 2}
          fill={playerColor}
          opacity="0.9"
          style={{
            transition: 'cx 0.3s ease, cy 0.3s ease',
            filter: `drop-shadow(0 0 4px ${playerColor})`,
          }}
        />
        <text
          x={currentPos.x}
          y={currentPos.y}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize="10"
          fontWeight="bold"
          pointerEvents="none"
        >
          {playerName}
        </text>
      </g>

      {/* Milestone markers (every 30 holes) */}
      {[0, 30, 60, 90, 120].map((milestone) => {
        const pos = getHolePosition(milestone);
        return (
          <text
            key={`milestone-${milestone}`}
            x={pos.x}
            y={pos.y - 20}
            textAnchor="middle"
            fontSize="10"
            fill="#9ca3af"
            pointerEvents="none"
          >
            {milestone}
          </text>
        );
      })}
    </svg>
  );
}
