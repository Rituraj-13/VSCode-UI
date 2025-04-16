import { useEffect, useRef, useState } from "react";
import { useEditorContext } from "@/context/EditorContext";
import { Suspense } from 'react';

// Dynamically import monaco to avoid worker initialization issues
import * as monaco from "monaco-editor";

// Set up Monaco environment
if (window.MonacoEnvironment === undefined) {
  // Use a simplified environment without web workers
  // This will let Monaco fall back to running in the main thread
  window.MonacoEnvironment = {
    // Function that returns a URL to load the worker from
    getWorkerUrl: function () {
      return '/monaco-fallback.js';
    }
  };
}

interface MonacoEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  theme: "vs-dark" | "vs-light";
}

// A simple loading component while Monaco initializes
function EditorLoading() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center">
        <div className="text-lg">Loading editor...</div>
        <div className="mt-2 text-sm text-gray-500">This may take a moment</div>
      </div>
    </div>
  );
}

export default function MonacoEditor({
  value,
  language,
  onChange,
  theme,
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentFile, setEditor: setEditorContext, setCursorPosition } = useEditorContext();

  // Initialize editor
  useEffect(() => {
    let mounted = true;

    const initMonaco = async () => {
      if (!editorRef.current || editor) return;

      setIsLoading(true);

      try {
        // Define options with proper type casting for Monaco
        const editorOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
          value,
          language,
          theme,
          automaticLayout: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: "Consolas, Monaco, 'Courier New', monospace",
          lineNumbers: 'on' as monaco.editor.LineNumbersType,
          wordWrap: 'on',
          scrollbar: {
            verticalScrollbarSize: 10,
          },
        };

        // Create the editor in DOM
        const newEditor = monaco.editor.create(editorRef.current, editorOptions);

        // Add Paste command handler
        newEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, async () => {
          try {
            const text = await navigator.clipboard.readText();
            if (text) {
              const selection = newEditor.getSelection();
              if (selection) {
                newEditor.executeEdits('clipboard-paste', [{
                  range: selection,
                  text: text,
                  forceMoveMarkers: true
                }]);
              }
            }
          } catch (err) {
            console.error("Paste failed:", err);
          }
        });

        // Add custom paste action that can be triggered from menu
        newEditor.addAction({
          id: 'editor.action.clipboardPasteAction',
          label: 'Paste',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV],
          run: async (editor) => {
            try {
              const text = await navigator.clipboard.readText();
              if (text) {
                const selection = editor.getSelection();
                if (selection) {
                  editor.executeEdits('clipboard-paste', [{
                    range: selection,
                    text: text,
                    forceMoveMarkers: true
                  }]);
                }
              }
            } catch (err) {
              console.error("Paste failed:", err);
            }
          }
        });

        // Add Cut action that can be triggered from menu
        newEditor.addAction({
          id: 'editor.action.clipboardCutAction',
          label: 'Cut',
          keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX],
          run: async (editor) => {
            const selection = editor.getSelection();
            if (selection && !selection.isEmpty()) {
              const text = editor.getModel()?.getValueInRange(selection) || '';
              try {
                await navigator.clipboard.writeText(text);
                editor.executeEdits('clipboard-cut', [{
                  range: selection,
                  text: '',
                  forceMoveMarkers: true
                }]);
              } catch (err) {
                console.error("Cut failed:", err);
              }
            }
          }
        });

        // Add change handler
        newEditor.onDidChangeModelContent(() => {
          onChange(newEditor.getValue());
        });

        // Add cursor position change listener
        newEditor.onDidChangeCursorPosition((e) => {
          setCursorPosition({
            line: e.position.lineNumber,
            column: e.position.column
          });
        });

        // Store editor instance in state
        if (mounted) {
          setEditor(newEditor);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing Monaco editor:", error);
        setIsLoading(false);
      }
    };

    initMonaco();

    return () => {
      mounted = false;

      // Store editor reference for cleanup
      const editorInstance = editor;

      // Clean up editor on unmount if it exists
      if (editorInstance) {
        try {
          editorInstance.dispose();
        } catch (err) {
          console.error("Error disposing editor:", err);
        }
      }
    };
  }, []);

  // Update editor value when file changes
  useEffect(() => {
    if (editor && value !== editor.getValue()) {
      editor.setValue(value);
    }
  }, [value, editor]);

  // Update editor language when it changes
  useEffect(() => {
    if (editor) {
      const model = editor.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language, editor]);

  // Update editor theme when it changes
  useEffect(() => {
    if (editor) {
      editor.updateOptions({ theme });
    }
  }, [theme, editor]);

  useEffect(() => {
    if (editor) {
      setEditorContext(editor);
      return () => setEditorContext(null);
    }
  }, [editor, setEditorContext]);

  return (
    <div className="h-full w-full overflow-hidden">
      {isLoading && <EditorLoading />}
      <div ref={editorRef} className="h-full w-full" />
    </div>
  );
}
