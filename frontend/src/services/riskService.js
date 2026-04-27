import API from './api';
export const getRiskMetrics = (regime) =>
  API.get('/risk/metrics' + (regime ? `?regime=${encodeURIComponent(regime)}` : ''));
export const getVaR = () => API.get('/risk/var');
