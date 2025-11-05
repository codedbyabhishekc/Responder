import React, { useState } from 'react';
import api from '../api';

export default function UsersAdmin() {
  const [form, setForm] = useState({ email:'', username:'', name:'', password:'', role:'user' });
  const [message, setMessage] = useState('');

  const createUser = async () => {
    setMessage('');
    try {
      await api.post('/api/users', form);
      setMessage('User created');
      setForm({ email:'', username:'', name:'', password:'', role:'user' });
    } catch (e) {
      setMessage(e.response?.data?.error || 'Failed');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Users Admin</h2>
      {message && <div className="text-sm mb-2">{message}</div>}
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="block">Email</label>
          <input value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        </div>
        <div>
          <label className="block">Username</label>
          <input value={form.username} onChange={e=>setForm({...form, username:e.target.value})} />
        </div>
        <div>
          <label className="block">Name</label>
          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        </div>
        <div>
          <label className="block">Password</label>
          <input type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        </div>
        <div>
          <label className="block">Role</label>
          <select value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>
      </div>
      <button onClick={createUser} className="mt-4 px-4 py-2 rounded-xl bg-black text-white">Create</button>
    </div>
  );
}
