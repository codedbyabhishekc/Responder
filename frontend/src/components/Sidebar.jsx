import React from 'react';

export default function Sidebar({ publicEndpoints, myEndpoints, onSelect, onCreateClick, onUsersClick, isAdmin }) {
  return (
    <aside className="w-72 bg-white border-r h-screen p-4 flex flex-col">
      <button onClick={onCreateClick} className="mb-4 py-2 rounded-xl bg-black text-white">
        + New Endpoint
      </button>

      <button onClick={()=>onSelect({ __openClient: true }, 'client')}
              className="mb-4 py-2 rounded-xl bg-gray-900/5 border">
        REST Client
      </button>

      {isAdmin && (
        <button onClick={onUsersClick} className="mb-4 py-2 rounded-xl bg-gray-900/5 border">
          Users Admin
        </button>
      )}

      <div className="flex-1 overflow-auto space-y-6">
        <section>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Public</h3>
          <ul className="space-y-1">
            {publicEndpoints.map(ep => (
              <li key={`pub-${ep.id}`}>
                <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                        onClick={()=>onSelect(ep, 'public')}>
                  {ep.name} <span className="text-xs text-gray-500">/{ep.owner_name}/{ep.slug}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Private (Mine)</h3>
          <ul className="space-y-1">
            {myEndpoints.filter(e=>!e.is_public).map(ep => (
              <li key={`mine-${ep.id}`}>
                <button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100"
                        onClick={()=>onSelect(ep, 'mine')}>
                  {ep.name} <span className="text-xs text-gray-500">/me/{ep.slug}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </aside>
  );
}
