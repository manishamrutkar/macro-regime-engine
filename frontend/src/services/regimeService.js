import API from './api';
export const getCurrentRegime    = ()  => API.get('/regime/current');
export const getRegimeHistory    = ()  => API.get('/regime/history');
export const getTransitionMatrix = ()  => API.get('/regime/transition-matrix');
export const refreshRegime       = ()  => API.post('/regime/refresh');
