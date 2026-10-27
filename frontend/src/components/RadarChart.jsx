import React, { useState } from 'react';

export default function RadarChart({ labels = [], benchmarkData = [], studentData = [], size = 380 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!labels.length) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No skill data available for chart</div>;
  }

  const center = size / 2;
  const radius = size * 0.38;
  const numAxes = labels.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Max scale is 3 (Advanced = 3, Intermediate = 2, Beginner = 1)
  const maxScale = 3;

  // Helper to get coordinates
  const getCoordinates = (value, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / maxScale) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // Build grid rings (1, 2, 3)
  const gridRings = [1, 2, 3].map((level) => {
    const points = [];
    for (let i = 0; i < numAxes; i++) {
      const { x, y } = getCoordinates(level, i);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  });

  // Build polygon path for benchmark
  const benchmarkPoints = benchmarkData.map((val, i) => {
    const { x, y } = getCoordinates(val, i);
    return `${x},${y}`;
  }).join(' ');

  // Build polygon path for student
  const studentPoints = studentData.map((val, i) => {
    const { x, y } = getCoordinates(val, i);
    return `${x},${y}`;
  }).join(' ');

  const levelLabels = { 0: 'None', 1: 'Beginner', 2: 'Intermediate', 3: 'Advanced' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.0" />
          </radialGradient>
          <linearGradient id="benchmarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="studentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Outer Background Glow */}
        <circle cx={center} cy={center} r={radius} fill="url(#radarGlow)" />

        {/* Concentric Grid Levels */}
        {gridRings.map((points, idx) => (
          <polygon
            key={idx}
            points={points}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeDasharray={idx < 2 ? "3 3" : "none"}
            strokeWidth="1.2"
          />
        ))}

        {/* Radial Axis Lines */}
        {labels.map((_, i) => {
          const { x, y } = getCoordinates(maxScale, i);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark Area */}
        <polygon
          points={benchmarkPoints}
          fill="url(#benchmarkGradient)"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeDasharray="4 2"
        />

        {/* Student Area */}
        <polygon
          points={studentPoints}
          fill="url(#studentGradient)"
          stroke="#c084fc"
          strokeWidth="2.5"
        />

        {/* Benchmark Markers */}
        {benchmarkData.map((val, i) => {
          const { x, y } = getCoordinates(val, i);
          return (
            <circle
              key={`bm-${i}`}
              cx={x}
              cy={y}
              r="3.5"
              fill="#38bdf8"
              stroke="#0b0f19"
              strokeWidth="1.5"
            />
          );
        })}

        {/* Student Markers with Interactive Hover */}
        {studentData.map((val, i) => {
          const { x, y } = getCoordinates(val, i);
          const isHovered = hoveredIdx === i;
          return (
            <g key={`st-${i}`} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} style={{ cursor: 'pointer' }}>
              <circle
                cx={x}
                cy={y}
                r={isHovered ? "7" : "4.5"}
                fill="#f43f5e"
                stroke="#fff"
                strokeWidth={isHovered ? "2.5" : "1.5"}
                style={{ transition: 'all 0.2s' }}
              />
            </g>
          );
        })}

        {/* Axis Labels */}
        {labels.map((label, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelDist = radius + 22;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);
          
          let textAnchor = "middle";
          if (Math.cos(angle) > 0.25) textAnchor = "start";
          else if (Math.cos(angle) < -0.25) textAnchor = "end";

          return (
            <text
              key={`label-${i}`}
              x={lx}
              y={ly}
              textAnchor={textAnchor}
              dominantBaseline="central"
              fill={hoveredIdx === i ? "#60a5fa" : "#cbd5e1"}
              fontSize="11px"
              fontWeight={hoveredIdx === i ? "700" : "500"}
              fontFamily="var(--font-sans)"
            >
              {label.length > 16 ? label.substring(0, 15) + '…' : label}
            </text>
          );
        })}
      </svg>

      {/* Chart Legend & Tooltip readout */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#38bdf8', display: 'inline-block' }}></span>
          <span style={{ color: 'var(--text-secondary)' }}>Industry Benchmark</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#c084fc', display: 'inline-block' }}></span>
          <span style={{ color: 'var(--text-secondary)' }}>Student Current Skill</span>
        </div>
      </div>

      {hoveredIdx !== null && (
        <div style={{
          marginTop: '10px',
          background: 'rgba(31, 41, 55, 0.95)',
          padding: '6px 14px',
          borderRadius: '100px',
          fontSize: '12px',
          border: '1px solid var(--border-medium)',
          color: 'var(--text-primary)'
        }}>
          <strong>{labels[hoveredIdx]}</strong>: You ({levelLabels[studentData[hoveredIdx]] || 'None'}) vs Target ({levelLabels[benchmarkData[hoveredIdx]]})
        </div>
      )}
    </div>
  );
}
