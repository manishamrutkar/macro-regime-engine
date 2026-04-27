-- Seed sample regime data for development/testing
INSERT INTO regimes (date, regime_id, label, confidence) VALUES
  ('2020-03-01', 3, 'Recession',      0.91),
  ('2020-09-01', 2, 'Liquidity Boom', 0.87),
  ('2021-06-01', 2, 'Liquidity Boom', 0.82),
  ('2022-01-01', 0, 'High Inflation', 0.88),
  ('2022-07-01', 1, 'Tight Policy',   0.85),
  ('2023-06-01', 2, 'Liquidity Boom', 0.79),
  ('2024-01-01', 2, 'Liquidity Boom', 0.84)
ON CONFLICT (date) DO NOTHING;
