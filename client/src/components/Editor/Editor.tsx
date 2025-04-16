import { useEditorContext } from '../../context/EditorContext';
import { Editor as MonacoEditorComponent } from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';

export default function MonacoEditor() {
  const { currentFile, updateFileContent } = useEditorContext();

  const handleEditorDidMount: OnMount = (_editor, _monaco) => {
    // Editor instance available for future use
    console.log('Editor mounted');
  };

  const handleChange = (value: string | undefined) => {
    if (currentFile && value !== undefined) {
      updateFileContent(currentFile.id, value);
    }
  };

  return (
    <div className="h-full w-full">
      {currentFile && (
        <MonacoEditorComponent
          height="100%"
          defaultLanguage={currentFile.language}
          value={currentFile.content}
          theme="vs-dark"
          onChange={handleChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            readOnly: false,
            automaticLayout: true,
          }}
        />
      )}
    </div>
  );
}