import React from 'react';

export default function LiveDot({ color = '#34d399', size = 6 }) {
  return (
    <span style={{
      display: 'inline-block',
      width: size, height: size,
      borderRadius: '50%',
      background: color,
      animation: 'pulse 2s infinite',
      marginRight: 4,
      flexShrink: 0,
    }} />
  );
}
