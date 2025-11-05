export const API_KEY_STORAGE = 'responder_api_key';
export function getApiKey() { return localStorage.getItem(API_KEY_STORAGE) || ''; }
export function setApiKey(v) { v ? localStorage.setItem(API_KEY_STORAGE, v) : localStorage.removeItem(API_KEY_STORAGE); }
