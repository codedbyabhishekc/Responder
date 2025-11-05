import React from 'react';

export default function EndpointsList({ items, onOpen, title = 'My Endpoints' }) {
  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <ul className="divide-y">
        {items.map(ep => (
          <li key={ep.id} className="py-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{ep.name}</div>
              <div className="text-xs text-gray-500">
                {ep.method} • {ep.is_public ? 'Public' : 'Private'}
                {ep.validate_with_schema ? ' • Schema ✓' : ''}
              </div>
            </div>
            <button onClick={()=>onOpen(ep)} className="px-3 py-1 rounded-xl border">Open</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
