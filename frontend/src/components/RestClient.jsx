import React, { useMemo, useState } from 'react';
import { getApiKey } from '../apiKeyStore';
import MonacoJsonEditor from './MonacoJsonEditor';
import { AnyJsonSchema, HeadersSchema } from '../schemas/jsonSchemas';
import Ajv from 'ajv';

const METHODS = ['GET','POST','PUT','PATCH','DELETE'];
const ajv = new Ajv({ allErrors: true, strict: false });

export default function RestClient({ prefill }) {
  const [method, setMethod] = useState(prefill?.method || 'GET');
  const [url, setUrl] = useState(prefill?.url || 'http://localhost:4000/responder/<username>/<slug>');
  const [headers, setHeaders] = useState(() => {
    const base = { 'Content-Type': 'application/json' };
    if (prefill?.requireApiKey && getApiKey()) base['x-api-key'] = getApiKey();
    return JSON.stringify(base, null, 2);
  });
  const [headersValid, setHeadersValid] = useState(true);

  const [body, setBody] = useState(prefill?.body || '');
  const [bodyValid, setBodyValid] = useState(true);

  const [schemaText, setSchemaText] = useState(prefill?.response_schema || '');
  const [useSchema, setUseSchema] = useState(!!prefill?.validate_with_schema && !!prefill?.response_schema);
  const [schemaValid, setSchemaValid] = useState(true);
  const schemaObj = useMemo(() => {
    try { return schemaText ? JSON.parse(schemaText) : null; } catch { return null; }
  }, [schemaText]);

  const [respText, setRespText] = useState('');
  const [respMeta, setRespMeta] = useState(null);
  const [respValidation, setRespValidation] = useState(null);
  const [loading, setLoading] = useState(false);

  const parsedHeaders = useMemo(() => {
    try { return headers ? JSON.parse(headers) : {}; } catch { return {}; }
  }, [headers]);

  async function send() {
    if (!headersValid) return;
    if (method !== 'GET' && body && !bodyValid) return;
    if (useSchema && !schemaValid) return;

    setLoading(true); setRespText(''); setRespMeta(null); setRespValidation(null);
    const started = performance.now();

    const init = { method, headers: parsedHeaders };
    if (method !== 'GET' && body) init.body = body;

    try {
      const res = await fetch(url, init);
      const text = await res.text();
      const duration = Math.round(performance.now() - started);
      let pretty = text; let parsed = null;
      try { parsed = JSON.parse(text); pretty = JSON.stringify(parsed, null, 2); } catch {}

      if (useSchema && schemaObj && parsed !== null) {
        try {
          const validate = ajv.compile(schemaObj);
          const ok = validate(parsed);
          setRespValidation({ ok, errors: ok ? [] : validate.errors });
        } catch (e) {
          setRespValidation({ ok: false, errors: [{ message: 'Invalid schema or cannot compile', error: String(e) }] });
        }
      }

      setRespText(pretty);
      setRespMeta({
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        timeMs: duration,
        headers: Array.from(res.headers.entries())
      });
    } catch (e) {
      setRespText(`Client error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow p-4 space-y-4">
      <div className="flex items-center gap-2">
        <select value={method} onChange={e=>setMethod(e.target.value)} className="w-28">
          {METHODS.map(m => <option key={m}>{m}</option>)}
        </select>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://api.example.com/..." />
        <button onClick={send} disabled={loading} className="px-4 py-2 rounded-xl bg-black text-white disabled:opacity-50">
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-medium">Headers (JSON object of strings)</div>
          <span className={`text-xs ${headersValid ? 'text-green-700' : 'text-red-700'}`}>
            {headersValid ? 'Valid' : 'Invalid'}
          </span>
        </div>
        <MonacoJsonEditor
          value={headers}
          onChange={setHeaders}
          schema={HeadersSchema}
          schemaUri="inmemory://schemas/headers.json"
          onValidChange={setHeadersValid}
          height={200}
        />
      </div>

      {method !== 'GET' && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-medium">Body (JSON)</div>
            <span className={`text-xs ${bodyValid ? 'text-green-700' : 'text-red-700'}`}>
              {bodyValid ? 'Valid' : 'Invalid'}
            </span>
          </div>
          <MonacoJsonEditor
            value={body || '{\n  \n}'}
            onChange={setBody}
            schema={AnyJsonSchema}
            schemaUri="inmemory://schemas/request-body.json"
            onValidChange={setBodyValid}
            height={260}
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input type="checkbox" checked={useSchema} onChange={e=>setUseSchema(e.target.checked)} />
        <span>Validate response against a JSON Schema</span>
      </div>

      {useSchema && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="text-sm font-medium">Response JSON Schema</div>
            <span className={`text-xs ${schemaValid ? 'text-green-700' : 'text-red-700'}`}>
              {schemaValid ? 'Valid JSON' : 'Invalid JSON'}
            </span>
          </div>
          <MonacoJsonEditor
            value={schemaText || '{\n  "type": "object"\n}'}
            onChange={setSchemaText}
            schema={AnyJsonSchema}
            schemaUri="inmemory://schemas/restclient-response-schema.json"
            onValidChange={setSchemaValid}
            height={260}
          />
        </div>
      )}

      {respMeta && (
        <div className="rounded-xl border p-3 text-sm space-y-2">
          <div className="flex flex-wrap gap-3">
            <span>Status: <b>{respMeta.status} {respMeta.statusText}</b></span>
            <span>Time: <b>{respMeta.timeMs} ms</b></span>
            <span>OK: <b>{String(respMeta.ok)}</b></span>
          </div>
          {useSchema && (
            <div className={`text-xs px-2 py-1 rounded ${respValidation?.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
              Schema validation: <b>{respValidation?.ok ? 'PASSED' : 'FAILED'}</b>
              {!respValidation?.ok && respValidation?.errors?.length > 0 && (
                <details className="mt-1">
                  <summary>Errors</summary>
                  <pre className="text-xs bg-white/60 p-2 rounded overflow-auto">
{JSON.stringify(respValidation.errors, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <div className="text-sm font-medium mb-1">Response</div>
        <pre className="text-xs bg-gray-50 p-3 rounded overflow-auto min-h-[120px]">{respText}</pre>
      </div>
    </div>
  );
}
