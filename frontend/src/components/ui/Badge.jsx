import React from 'react';

const VARIANTS = {
  green:  'badge-green',
  amber:  'badge-amber',
  blue:   'badge-blue',
  red:    'badge-red',
  purple: 'badge-purple',
};

export default function Badge({ children, variant = 'green', style = {} }) {
  return (
    <span className={`badge ${VARIANTS[variant] || ''}`} style={style}>
      {children}
    </span>
  );
}
