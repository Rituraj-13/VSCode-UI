/**
 * Basic worker for Monaco Editor
 * This provides a fallback implementation for Monaco Editor's workers
 */
self.MonacoEnvironment = {
  baseUrl: 'https://unpkg.com/monaco-editor@0.37.1/min/'
};

// Import the real editor worker from CDN with a specific version for stability
importScripts('https://unpkg.com/monaco-editor@0.37.1/min/vs/base/worker/workerMain.js');