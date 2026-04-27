import React from 'react';
import { fmtArrow } from '../../utils/formatters';

const TICKERS = [
  { sym: 'DXY',     val: '104.2',  chg: -0.0034 },
  { sym: 'EUR/USD', val: '1.0842', chg:  0.0021  },
  { sym: '2Y/10Y',  val: '-42bps', chg: -1,       special: true },
  { sym: 'WTI Oil', val: '$82.4',  chg:  0.012   },
  { sym: 'Gold',    val: '$2,341', chg:  0.008   },
  { sym: 'Silver',  val: '$27.6',  chg:  0.005   },
  { sym: 'ETH',     val: '$3,180', chg:  0.021   },
  { sym: 'SOL',     val: '$142.3', chg: -0.009   },
];

export default function TickerBar({ data = TICKERS }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0,1fr))', gap: 8, marginBottom: 12 }}>
      {data.map((t) => {
        const isUp = t.chg >= 0;
        const color = t.special ? '#f87171' : isUp ? '#34d399' : '#f87171';
        return (
          <div key={t.sym} className="glass" style={{ padding: '9px 11px' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.sym}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginTop: 2, letterSpacing: '-0.03em' }}>{t.val}</div>
            <div style={{ fontSize: 9, marginTop: 2, color }}>
              {t.special ? '▼ Inverted' : `${fmtArrow(t.chg)} ${(Math.abs(t.chg) * 100).toFixed(2)}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
}
