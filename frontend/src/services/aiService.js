import API from './api';
export const chat            = (message, mode = 'auto', history = []) => API.post('/ai/chat',            { message, mode, history });
export const ragQuery        = (query)                                  => API.post('/ai/rag-query',       { query });
export const getMarketSummary = ()                                      => API.get('/ai/market-summary');
export const agentRun        = (question)                               => API.post('/ai/agent-run',       { question });
export const tradeRecommend  = (asset, regime_id)                       => API.post('/ai/trade-recommend', { asset, regime_id });
export const uploadDocument  = (text, title, source)                    => API.post('/ai/upload-doc',      { text, title, source });
