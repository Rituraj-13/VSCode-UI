import * as monaco from 'monaco-editor';

// This line tells TypeScript that window has a MonacoEnvironment property
declare global {
  interface Window {
    MonacoEnvironment?: monaco.Environment;
  }
}

/**
 * Initialize Monaco Editor's web workers
 * Using CDN-based approach for simplicity and compatibility
 */
export function setupMonacoWorkers(): void {
  // Set up the worker URL to point to our static worker file
  // This worker will proxy to CDN workers as needed
  window.MonacoEnvironment = {
    getWorkerUrl: function () {
      return '/monaco-editor-worker.js';
    }
  };
}

/**
 * Define custom themes for Monaco Editor
 */
export function setupMonacoThemes(): void {
  // Define Dark Theme
  monaco.editor.defineTheme('vs-dark-custom', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1E1E1E',
      'editor.foreground': '#D4D4D4',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#C6C6C6',
      'editor.selectionBackground': '#264F78',
      'editor.lineHighlightBackground': '#2A2D2E',
    },
  });

  // Define Light Theme
  monaco.editor.defineTheme('vs-light-custom', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#FFFFFF',
      'editor.foreground': '#333333',
      'editorLineNumber.foreground': '#999999',
      'editorLineNumber.activeForeground': '#333333',
      'editor.selectionBackground': '#ADD6FF',
      'editor.lineHighlightBackground': '#F5F5F5',
    },
  });
}

/**
 * Initialize Monaco Editor 
 */
export function initializeMonaco(): void {
  setupMonacoWorkers();
  setupMonacoThemes();
}