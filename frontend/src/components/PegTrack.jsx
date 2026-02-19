import React, { useEffect, useState } from 'react';
import styles from './Animations.module.css';

export default function PegTrack({ 
  p1CurrentPosition = 0, 
  p1PreviousPosition = 0,
  p2CurrentPosition = 0, 
  p2PreviousPosition = 0 
}) {
  // Track if pegs are animating
  const [p1Animating, setP1Animating] = useState(false);
  const [p2Animating, setP2Animating] = useState(false);
  
  // Detect position changes and trigger animation
  useEffect(() => {
    if (p1CurrentPosition !== p1PreviousPosition && p1PreviousPosition > 0) {
      setP1Animating(true);
      const timer = setTimeout(() => setP1Animating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [p1CurrentPosition, p1PreviousPosition]);
  
  useEffect(() => {
    if (p2CurrentPosition !== p2PreviousPosition && p2PreviousPosition > 0) {
      setP2Animating(true);
      const timer = setTimeout(() => setP2Animating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [p2CurrentPosition, p2PreviousPosition]);

  // Traditional U-shaped board with 60 holes per player track
  const holeRadius = 5;
  const holeSpacingX = 16;
  const holeSpacingY = 20;
  const paddingX = 40;
  const paddingY = 30;

  // U-shaped layout: P1 goes up left side, across top, down right side
  const getP1Position = (index) => {
    if (index === 0) return { x: paddingX + 30, y: paddingY + 220 };
    if (index === 60) return { x: paddingX + 30, y: paddingY + 220 };
    
    const adjustedIndex = index - 1;
    const segment = Math.floor(adjustedIndex / 15);
    const posInSegment = adjustedIndex % 15;
    
    let x, y;
    
    if (segment === 0) {
      x = paddingX + 30 + posInSegment * holeSpacingX;
      y = paddingY + 220;
    } else if (segment === 1) {
      x = paddingX + 240 - posInSegment * holeSpacingX;
      y = paddingY + 30;
    } else if (segment === 2 || segment === 3) {
      x = paddingX + 240;
      y = paddingY + 30 + (posInSegment + (segment - 2) * 15) * holeSpacingY;
    }
    
    return { x, y };
  };

  const getP2Position = (index) => {
    if (index === 0) return { x: paddingX + 80, y: paddingY + 220 };
    if (index === 60) return { x: paddingX + 80, y: paddingY + 220 };
    
    const adjustedIndex = index - 1;
    const segment = Math.floor(adjustedIndex / 15);
    const posInSegment = adjustedIndex % 15;
    
    let x, y;
    
    if (segment === 0) {
      x = paddingX + 80 - posInSegment * holeSpacingX;
      y = paddingY + 220;
    } else if (segment === 1) {
      x = paddingX + 80 + posInSegment * holeSpacingX;
      y = paddingY + 30;
    } else if (segment === 2 || segment === 3) {
      x = paddingX + 80;
      y = paddingY + 30 + (posInSegment + (segment - 2) * 15) * holeSpacingY;
    }
    
    return { x, y };
  };

  const isTenMarker = (index) => index % 10 === 0;

  const width = 320;
  const height = 280;

  // Render a 3D cylindrical peg with optional animation
  const renderPeg = (x, y, color, label, isCurrent, isAnimating) => {
    const gradientId = color === 'ivory' ? 'pegIvory' : 'pegDark';
    
    return (
      <g 
        className={isAnimating ? styles.pegMoving : ''}
        style={{ transition: 'all 0.3s ease-out' }}
      >
        {/* Peg shadow */}
        <ellipse cx={x + 1} cy={y + 4} rx={holeRadius + 1} ry={3} fill="rgba(0,0,0,0.4)" />
        
        {/* Peg body */}
        <ellipse cx={x} cy={y + 2} rx={holeRadius} ry={holeRadius - 1} fill={`url(#${gradientId})`} />
        <rect x={x - holeRadius + 1} y={y - holeRadius + 2} width={(holeRadius - 1) * 2} height={holeRadius + 1} fill={`url(#${gradientId})`} />
        <ellipse cx={x} cy={y - holeRadius + 2} rx={holeRadius - 1} ry={2} fill={`url(#${gradientId}Top)`} />
        
        {/* Highlight */}
        <ellipse cx={x - 1} cy={y - 1} rx={2} ry={1.5} fill="rgba(255,255,255,0.5)" />
        
        {/* Glow for current peg */}
        {isCurrent && (
          <circle cx={x} cy={y} r={holeRadius + 4} fill="none" stroke={color === 'ivory' ? '#fbbf24' : '#ef4444'} strokeWidth="2" opacity="0.6">
            <animate attributeName="r" values={`${holeRadius + 2};${holeRadius + 5};${holeRadius + 2}`} dur="1.5s" repeatCount="indefinite" />
          </circle>
        )}
        
        {/* Label */}
        <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" 
          fill={color === 'ivory' ? '#3d2817' : '#1a0f0a'} fontSize="6" fontWeight="bold">
          {label}
        </text>
      </g>
    );
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
      <defs>
        <linearGradient id="pegIvory" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5e6d3" />
          <stop offset="50%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#b8956e" />
        </linearGradient>
        <radialGradient id="pegIvoryTop" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#fff5e6" />
          <stop offset="100%" stopColor="#d4a574" />
        </radialGradient>
        
        <linearGradient id="pegDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5a4a3a" />
          <stop offset="50%" stopColor="#3d2e22" />
          <stop offset="100%" stopColor="#2a1f17" />
        </linearGradient>
        <radialGradient id="pegDarkTop" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#8b7355" />
          <stop offset="100%" stopColor="#3d2e22" />
        </radialGradient>

        <radialGradient id="holeShadow" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#1a1209" />
          <stop offset="100%" stopColor="#0d0906" />
        </radialGradient>
      </defs>

      {/* Track labels */}
      <text x={paddingX + 15} y={paddingY + 260} fill="#a78b5b" fontSize="10" fontWeight="bold" fontFamily="Georgia">Player 1 (You)</text>
      <text x={paddingX + 15} y={paddingY + 275} fill="#a78b5b" fontSize="10" fontWeight="bold" fontFamily="Georgia">Player 2</text>

      {/* Player 1 track (outer) */}
      <g>
        {Array.from({ length: 61 }, (_, i) => i).map((index) => {
          const pos = getP1Position(index);
          const isTen = isTenMarker(index);
          
          return (
            <g key={`p1-hole-${index}`}>
              <circle cx={pos.x} cy={pos.y} r={isTen ? holeRadius + 1.5 : holeRadius} fill="#2a1810" />
              <circle cx={pos.x} cy={pos.y} r={isTen ? holeRadius : holeRadius - 1} fill="url(#holeShadow)" />
              {isTen && index > 0 && index < 60 && (
                <text x={pos.x} y={pos.y - 10} textAnchor="middle" fill="#a78b5b" fontSize="8" fontWeight="bold">
                  {index}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Player 1 pegs */}
        {p1PreviousPosition > 0 && p1PreviousPosition <= 60 && (
          renderPeg(getP1Position(p1PreviousPosition).x, getP1Position(p1PreviousPosition).y, 'ivory', '', false, false)
        )}
        {p1CurrentPosition > 0 && p1CurrentPosition <= 60 && (
          renderPeg(getP1Position(p1CurrentPosition).x, getP1Position(p1CurrentPosition).y, 'ivory', 'P1', true, p1Animating)
        )}
      </g>

      {/* Track divider */}
      <rect x={paddingX + 20} y={paddingY + 50} width={240} height={3} fill="#3d2817" rx="1" />

      {/* Player 2 track (inner) */}
      <g>
        {Array.from({ length: 61 }, (_, i) => i).map((index) => {
          const pos = getP2Position(index);
          const isTen = isTenMarker(index);
          
          return (
            <g key={`p2-hole-${index}`}>
              <circle cx={pos.x} cy={pos.y} r={isTen ? holeRadius + 1.5 : holeRadius} fill="#2a1810" />
              <circle cx={pos.x} cy={pos.y} r={isTen ? holeRadius : holeRadius - 1} fill="url(#holeShadow)" />
              {isTen && index > 0 && index < 60 && (
                <text x={pos.x} y={pos.y + 18} textAnchor="middle" fill="#a78b5b" fontSize="8" fontWeight="bold">
                  {index}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Player 2 pegs */}
        {p2PreviousPosition > 0 && p2PreviousPosition <= 60 && (
          renderPeg(getP2Position(p2PreviousPosition).x, getP2Position(p2PreviousPosition).y, 'dark', '', false, false)
        )}
        {p2CurrentPosition > 0 && p2CurrentPosition <= 60 && (
          renderPeg(getP2Position(p2CurrentPosition).x, getP2Position(p2CurrentPosition).y, 'dark', 'P2', true, p2Animating)
        )}
      </g>

      {/* START/HOME markers */}
      <text x={getP1Position(0).x - 15} y={getP1Position(0).y + 3} fill="#fbbf24" fontSize="8" fontWeight="bold">START</text>
      <text x={getP1Position(60).x - 15} y={getP1Position(60).y + 3} fill="#fbbf24" fontSize="8" fontWeight="bold">HOME</text>
    </svg>
  );
}
