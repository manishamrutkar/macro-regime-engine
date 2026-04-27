import React from 'react';

/**
 * Reusable glassmorphism card wrapper.
 * Props: className, style, padding (default '18px 20px'), strong
 */
export default function GlassCard({ children, className = '', style = {}, padding = '18px 20px', strong = false }) {
  return (
    <div
      className={`${strong ? 'glass-strong' : 'glass'} ${className}`}
      style={{ padding, ...style }}
    >
      {children}
    </div>
  );
}
