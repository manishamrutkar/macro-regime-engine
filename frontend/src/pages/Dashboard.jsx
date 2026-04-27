import React from 'react';
import PageWrapper from '../components/layout/PageWrapper';
import TickerBar from '../components/ui/TickerBar';
import MacroIndicators from '../components/panels/MacroIndicators';
import RegimePanel from '../components/panels/RegimePanel';
import AllocationPanel from '../components/panels/AllocationPanel';
import ForecastPanel from '../components/panels/ForecastPanel';
import VaRPanel from '../components/panels/VaRPanel';
import SentimentPanel from '../components/panels/SentimentPanel';
import PerformanceChart from '../components/charts/PerformanceChart';
import CorrelationHeatmap from '../components/charts/CorrelationHeatmap';
import TransitionMatrix from '../components/charts/TransitionMatrix';
import SectorHeatmap from '../components/charts/SectorHeatmap';
import YieldCurveChart from '../components/charts/YieldCurveChart';
import { useRegime } from '../hooks/useRegime';
import { useRiskMetrics } from '../hooks/useRiskMetrics';
import { useSentiment } from '../hooks/useSentiment';
import { useForecast } from '../hooks/useForecast';
import { useMarketData } from '../hooks/useMarketData';

export default function Dashboard() {
  const { current, history, transition }       = useRegime();
  const { metrics: riskMetrics, var: varData } = useRiskMetrics(current?.regime_name);
  const { sentiment }                          = useSentiment();
  const { forecast }                           = useForecast();
  const { yieldCurve, sectors }                = useMarketData();

  const regimeId       = current?.regime_id ?? 2;
  const currentMetrics = riskMetrics?.[current?.regime_name]?.SP500 || null;

  return (
    <PageWrapper
      title="Dashboard"
      subtitle="Macro regime detection and cross-asset risk intelligence"
    >
      {/* Ticker Bar */}
      <TickerBar />

      {/* Macro KPIs */}
      <MacroIndicators />

      {/* Row 1: Regime + Allocation + Forecast */}
      <div className="grid-3" style={{ marginBottom: 12 }}>
        <RegimePanel regime={current} history={history} />
        <AllocationPanel regimeId={regimeId} riskMetrics={currentMetrics} />
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <ForecastPanel forecast={forecast} />
          <VaRPanel varData={varData} />
        </div>
      </div>

      {/* Row 2: Performance Chart + Sentiment */}
      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 0.6fr', gap:12, marginBottom:12 }}>
        <PerformanceChart />
        <SentimentPanel sentiment={sentiment} />
      </div>

      {/* Row 3: Heatmap + Sector + Yield */}
      <div className="grid-3" style={{ marginBottom: 12 }}>
        <CorrelationHeatmap />
        <SectorHeatmap sectors={sectors?.['Liquidity Boom']?.ranked_by_return?.map(s => ({ name: s.sector.slice(0,8), ret: s.ann_return }))} />
        <YieldCurveChart yieldData={yieldCurve} />
      </div>

      {/* Row 4: Transition Matrix */}
      <TransitionMatrix matrix={
        transition
          ? Object.values(transition).map(row => Object.values(row))
          : undefined
      } />
    </PageWrapper>
  );
}
