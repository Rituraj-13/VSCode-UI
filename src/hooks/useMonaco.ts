import { useState, useEffect } from "react";
import * as monaco from "monaco-editor";
import { initializeMonaco } from "@/lib/monaco-loader";

interface UseMonacoReturn {
  monacoInstance: typeof monaco | null;
  editor: monaco.editor.IStandaloneCodeEditor | null;
  setEditor: (editor: monaco.editor.IStandaloneCodeEditor | null) => void;
}

export function useMonaco(): UseMonacoReturn {
  const [monacoInstance, setMonacoInstance] = useState<typeof monaco | null>(null);
  const [editor, setEditor] = useState<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    // Initialize Monaco editor with proper web worker setup
    // and load it asynchronously
    const loadMonaco = async () => {
      try {
        // Initialize Monaco with web workers and themes
        initializeMonaco();
        
        // Set the Monaco instance for use in components
        setMonacoInstance(monaco);
      } catch (error) {
        console.error("Failed to load Monaco Editor:", error);
      }
    };

    loadMonaco();

    // Clean up when component unmounts
    return () => {
      if (editor) {
        editor.dispose();
        setEditor(null);
      }
    };
  }, []);

  return { monacoInstance, editor, setEditor };
}
