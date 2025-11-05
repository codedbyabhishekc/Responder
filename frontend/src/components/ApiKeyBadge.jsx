import React, { useState } from 'react';
import { getApiKey, setApiKey } from '../apiKeyStore';
import { KeyRound, Trash2 } from 'lucide-react';

export default function ApiKeyBadge() {
  const [k, setK] = useState(getApiKey());
  const masked = k ? k.slice(0,6) + '…' + k.slice(-4) : '';

  const onSave = () => {
    const v = prompt('Paste your GLOBAL API KEY (mk_…):', k || '');
    if (v !== null) { setApiKey(v.trim()); setK(getApiKey()); }
  };
  const onClear = () => { setApiKey(''); setK(''); };

  return (
    <div className="flex items-center gap-2">
      <button onClick={onSave} className="inline-flex items-center gap-2 rounded-xl border px-3 py-1 hover:bg-gray-50">
        <KeyRound className="w-4 h-4" />
        {k ? <code className="text-xs">{masked}</code> : <span className="text-sm">Set API Key</span>}
      </button>
      {k && (
        <button onClick={onClear} title="Clear" className="rounded-xl border px-2 py-1 hover:bg-gray-50">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
