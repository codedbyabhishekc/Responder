import { useState, useEffect } from 'react';
import api, { setToken } from './api';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [token, setTok] = useState(localStorage.getItem('token'));

  useEffect(() => {
    setToken(token);
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
  }, [token]);

  return { user, setUser, token, setToken: setTok };
}
