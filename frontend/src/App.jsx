import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { useAuth } from './store';

export default function App() {
  const auth = useAuth();
  const [loggedIn, setLoggedIn] = useState(!!auth.token);
  return loggedIn
    ? <Dashboard auth={auth} onLogout={() => { auth.setToken(null); setLoggedIn(false); }} />
    : <Login auth={auth} onLogin={() => setLoggedIn(true)} />;
}
