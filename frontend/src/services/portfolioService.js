import API from './api';
export const simulatePortfolio = (weights) => API.post('/portfolio/simulate', weights);
export const getMonteCarlo     = ()         => API.get('/portfolio/monte-carlo');
