import React, { useState } from 'react';
import api from '../api';

export default function Login({ auth, onLogin }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      auth.setToken(data.token);
      auth.setUser(data.user);
      onLogin();
    } catch (e) {
      setErr(e.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4">
      <form onSubmit={submit} className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        {err && <div className="text-sm text-red-600 mb-3">{err}</div>}
        <label className="block mb-2">Email</label>
        <input className="w-full mb-4" value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
        <label className="block mb-2">Password</label>
        <input className="w-full mb-6" value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <button className="w-full py-2 rounded-xl bg-black text-white">Login</button>
      </form>
    </div>
  );
}
