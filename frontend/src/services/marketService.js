import API from './api';
export const getTickers    = () => API.get('/market/tickers');
export const getYieldCurve = () => API.get('/market/yield-curve');
export const getSectors    = () => API.get('/market/sectors');
