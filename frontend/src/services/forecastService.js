import API from './api';

export const getForecast       = ()  => API.get('/forecast/next-regime');
export const getBacktestResults = () => API.get('/backtest/results');
