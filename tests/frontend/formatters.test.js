import { fmtPct, fmtPctRaw, fmtNum, fmtUSD, fmtDate, fmtCompact, fmtChange } from '../../frontend/src/utils/formatters';

describe('fmtPct', () => {
  it('formats positive decimal as percentage', () => {
    expect(fmtPct(0.123)).toBe('+12.3%');
  });
  it('formats negative decimal as percentage', () => {
    expect(fmtPct(-0.05)).toBe('-5.0%');
  });
  it('returns dash for null', () => {
    expect(fmtPct(null)).toBe('—');
  });
  it('respects decimals param', () => {
    expect(fmtPct(0.1234, 2)).toBe('+12.34%');
  });
});

describe('fmtNum', () => {
  it('formats number with 2 decimals by default', () => {
    expect(fmtNum(1.4267)).toBe('1.43');
  });
  it('returns dash for null', () => {
    expect(fmtNum(null)).toBe('—');
  });
});

describe('fmtCompact', () => {
  it('formats billions', () => {
    expect(fmtCompact(1500000000)).toBe('1.5B');
  });
  it('formats millions', () => {
    expect(fmtCompact(2500000)).toBe('2.5M');
  });
  it('formats thousands', () => {
    expect(fmtCompact(1500)).toBe('1.5K');
  });
  it('formats small numbers as-is', () => {
    expect(fmtCompact(42)).toBe('42');
  });
});

describe('fmtChange', () => {
  it('shows up arrow for positive', () => {
    expect(fmtChange(0.05)).toContain('▲');
  });
  it('shows down arrow for negative', () => {
    expect(fmtChange(-0.03)).toContain('▼');
  });
});
