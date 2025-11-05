import React, { useCallback, useMemo, useRef } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';

export default function MonacoJsonEditor({
  value,
  onChange,
  height = 260,
  schema,
  schemaUri = 'inmemory://model/schema.json',
  readOnly = false,
  onValidChange
}) {
  const monaco = useMonaco();
  const errorsRef = useRef([]);

  React.useEffect(() => {
    if (!monaco) return;
    const json = monaco.languages.json;
    const diagnostics = {
      validate: true,
      allowComments: true,
      trailingCommas: 'ignore',
      enableSchemaRequest: false,
      schemas: schema ? [{
        uri: schemaUri,
        fileMatch: ['*'],
        schema
      }] : []
    };
    json.jsonDefaults.setDiagnosticsOptions(diagnostics);
  }, [monaco, schema, schemaUri]);

  const handleChange = useCallback((v) => {
    onChange?.(v ?? '');
  }, [onChange]);

  const onValidate = useCallback((markers) => {
    errorsRef.current = markers;
    onValidChange?.(markers.length === 0);
  }, [onValidChange]);

  const options = useMemo(() => ({
    minimap: { enabled: false },
    wordWrap: 'on',
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    lineNumbersMinChars: 3,
    readOnly,
    tabSize: 2,
    fontSize: 13
  }), [readOnly]);

  const path = useMemo(() => `inmemory://model/${Math.random().toString(36).slice(2)}.json`, []);

  return (
    <div className="rounded-2xl border overflow-hidden">
      <Editor
        height={height}
        defaultLanguage="json"
        value={value}
        onChange={handleChange}
        onValidate={onValidate}
        options={options}
        path={path}
      />
    </div>
  );
}
