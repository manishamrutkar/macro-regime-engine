import API from './api';
export const getSentimentScores = () => API.get('/sentiment/scores');
export const getFearGreed       = () => API.get('/sentiment/fear-greed');
