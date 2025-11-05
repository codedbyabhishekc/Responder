import React, { useEffect, useState } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import EndpointForm from '../components/EndpointForm';
import EndpointsList from '../components/EndpointsList';
import ApiKeyBadge from '../components/ApiKeyBadge';
import RestClient from '../components/RestClient';

export default function Dashboard({ auth, onLogout }) {
  const [data, setData] = useState({ mine: [], public: [] });
  const [view, setView] = useState('list'); // 'list' | 'form' | 'admin' | 'detail' | 'client'
  const [selected, setSelected] = useState(null);
  const [apiKey, setApiKey] = useState(null);

  async function refresh() {
    const { data } = await api.get('/api/endpoints');
    setData(data);
  }
  useEffect(() => { refresh(); }, []);

  const saveEndpoint = async (payload) => {
    await api.post('/api/endpoints', payload);
    setView('list'); refresh();
  };

  const generateKey = async () => {
    const { data } = await api.post('/api/me/api-key');
    setApiKey(data.apiKey);
  };

  return (
    <div className="flex">
      <Sidebar
        publicEndpoints={data.public}
        myEndpoints={data.mine}
        onSelect={(ep, section)=>{
          if (ep?.__openClient) { setSelected(null); setView('client'); return; }
          setSelected(ep); setView('detail');
        }}
        onCreateClick={()=>setView('form')}
        onUsersClick={()=>setView('admin')}
        isAdmin={auth.user?.role === 'admin'}
      />
      <main className="flex-1 p-6 space-y-6">
        <header className="flex items-center justify-between">
          <div className="text-xl font-semibold">Responder</div>
          <div className="flex items-center gap-3">
            <button className="rounded-xl border px-3 py-1" onClick={generateKey}>Generate API Key</button>
            {apiKey && <code className="text-xs bg-gray-100 px-2 py-1 rounded">Save this: {apiKey}</code>}
            <ApiKeyBadge />
            <button className="rounded-xl border px-3 py-1" onClick={onLogout}>Logout</button>
          </div>
        </header>

        {view === 'form' && (
          <EndpointForm onSave={saveEndpoint} onCancel={()=>setView('list')} />
        )}

        {view === 'list' && (
          <>
            <EndpointsList items={data.mine} onOpen={(ep)=>{setSelected(ep); setView('detail');}} />
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow p-4">
                <h2 className="text-lg font-semibold mb-2">How to call endpoints</h2>
                <pre className="text-xs bg-gray-50 p-3 rounded">
GET {typeof __API__ !== 'undefined' ? __API__ : 'http://localhost:4000'}/responder/&lt;username&gt;/&lt;slug&gt;
# Private endpoints:
Header: x-api-key: &lt;your_global_api_key&gt;
                </pre>
              </div>
            </div>
          </>
        )}

        {view === 'detail' && selected && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-lg font-semibold">{selected.name}</div>
                  <div className="text-xs text-gray-500">{selected.method} • {selected.is_public ? 'Public' : 'Private'}</div>
                </div>
                <button className="rounded-xl border px-3 py-1" onClick={()=>setView('form')}>Create new</button>
              </div>
              <div className="text-sm">
                <div className="mb-2 font-mono">
                  Path: {selected.owner_name
                    ? `/responder/${selected.owner_name}/${selected.slug}`
                    : `/responder/<username>/${selected.slug}`}
                </div>
                <div className="text-xs text-gray-500 mb-2">Response:</div>
                <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">{selected.response_json}</pre>
              </div>
            </div>

            <RestClient prefill={{
              method: selected.method,
              url: (typeof __API__ !== 'undefined' ? __API__ : 'http://localhost:4000') + (selected.owner_name
                ? `/responder/${selected.owner_name}/${selected.slug}`
                : `/responder/<username>/${selected.slug}`),
              requireApiKey: !selected.is_public,
              body: selected.method === 'POST' ? '{\n  "example": true\n}' : '',
              response_schema: selected.response_schema || '',
              validate_with_schema: !!selected.validate_with_schema
            }} />
          </div>
        )}

        {view === 'client' && (
          <div className="space-y-4">
            <div className="text-lg font-semibold">REST Client</div>
            <RestClient />
          </div>
        )}
      </main>
    </div>
  );
}
