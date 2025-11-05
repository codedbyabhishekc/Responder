import React, { useState } from 'react';
import MonacoJsonEditor from './MonacoJsonEditor';
import { AnyJsonSchema } from '../schemas/jsonSchemas';

export default function EndpointForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [method, setMethod] = useState(initial?.method || 'GET');
  const [isPublic, setIsPublic] = useState(initial?.is_public ?? true);

  const [json, setJson] = useState(initial?.response_json || '{\n  "ok": true\n}');
  const [jsonValid, setJsonValid] = useState(true);

  const [useSchema, setUseSchema] = useState(!!initial?.validate_with_schema);
  const [schemaText, setSchemaText] = useState(initial?.response_schema || '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "type": "object"\n}');
  const [schemaValid, setSchemaValid] = useState(true);

  const canSave = name && slug && jsonValid && (!useSchema || (useSchema && schemaValid));

  const handleSave = () => {
    try { JSON.parse(json); } catch { return; }
    let payload = {
      name, slug, method,
      is_public: isPublic,
      response_json: json,
      validate_with_schema: useSchema
    };
    if (useSchema) {
      try { JSON.parse(schemaText); payload.response_schema = schemaText; }
      catch { return; }
    } else {
      payload.response_schema = null;
    }
    onSave(payload);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="grid gap-3">
        <div>
          <label className="block text-sm">Name *</label>
          <input value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm">Slug *</label>
          <input value={slug} onChange={e=>setSlug(e.target.value)} placeholder="my-endpoint" />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm">Method</label>
            <select value={method} onChange={e=>setMethod(e.target.value)}>
              <option>GET</option>
              <option>POST</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isPublic} onChange={e=>setIsPublic(e.target.checked)} />
            <span>Public</span>
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm">JSON Response *</label>
            <span className={`text-xs ${jsonValid ? 'text-green-700' : 'text-red-700'}`}>
              {jsonValid ? 'Valid JSON' : 'Invalid JSON'}
            </span>
          </div>
          <MonacoJsonEditor
            value={json}
            onChange={setJson}
            schema={AnyJsonSchema}
            schemaUri="inmemory://schemas/endpoint-response.json"
            onValidChange={setJsonValid}
            height={280}
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" checked={useSchema} onChange={e=>setUseSchema(e.target.checked)} />
          <span>Validate response against a JSON Schema</span>
        </div>

        {useSchema && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm">Response JSON Schema *</label>
              <span className={`text-xs ${schemaValid ? 'text-green-700' : 'text-red-700'}`}>
                {schemaValid ? 'Valid JSON' : 'Invalid JSON'}
              </span>
            </div>
            <MonacoJsonEditor
              value={schemaText}
              onChange={setSchemaText}
              schema={AnyJsonSchema}
              schemaUri="inmemory://schemas/endpoint-response-schema.json"
              onValidChange={setSchemaValid}
              height={320}
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Include <code>"$schema": "http://json-schema.org/draft-07/schema#"</code> at the top.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50"
          >
            Save
          </button>
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border">Cancel</button>
        </div>
      </div>
    </div>
  );
}
