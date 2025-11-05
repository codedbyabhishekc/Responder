import React, { useState } from 'react';
import { getApiKey } from '../apiKeyStore';

export default function TryIt({ defaultOwner='admin', endpoint }) {
  const [owner, setOwner] = useState(defaultOwner);
  const [body, setBody]   = useState('');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState('');

  const callEndpoint = async () => {
    if (!endpoint) return;
    setLoading(true); setResp('');
    const apiKey = getApiKey();
    const base = typeof __API__ !== 'undefined' ? __API__ : 'http://localhost:4000';
    const url = `${base}/responder/${owner}/${endpoint.slug}`;
    const headers = { 'Content-Type': 'application/json' };
    if (!endpoint.is_public && apiKey) headers['x-api-key'] = apiKey;

    try {
      const res = await fetch(url, {
        method: endpoint.method,
        headers,
        body: endpoint.method === 'POST' ? (body || '{}') : undefined
      });
      const text = await res.text();
      setResp(text);
    } catch (e) {
      setResp(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Try this endpoint</div>
        <button
          onClick={callEndpoint}
          disabled={loading || !endpoint}
          className="inline-flex items-center gap-2 rounded-xl bg-black text-white px-3 py-1 disabled:opacity-50"
        >
          Run
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm text-gray-600">Owner (username or id)</label>
          <input value={owner} onChange={e=>setOwner(e.target.value)} placeholder="admin" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Method</label>
          <input value={endpoint?.method || ''} disabled />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Slug</label>
          <input value={endpoint?.slug || ''} disabled />
        </div>
      </div>

      {endpoint?.method === 'POST' && (
        <div>
          <label className="block text-sm text-gray-600">Body (JSON)</label>
          <textarea className="font-mono" rows="6" value={body} onChange={e=>setBody(e.target.value)} placeholder='{"foo":"bar"}' />
        </div>
      )}

      {resp && (
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto">{resp}</pre>
      )}

      {!endpoint?.is_public && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          This is a <strong>private</strong> endpoint. The UI will include your <code>x-api-key</code> automatically if you’ve set it.
        </div>
      )}
    </div>
  );
}
