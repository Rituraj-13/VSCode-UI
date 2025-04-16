// This is a basic fallback for Monaco Editor that doesn't try to use importScripts
// Instead, this hooks into Monaco's self-handling mechanisms
self.MonacoEnvironment = {
  baseUrl: 'https://unpkg.com/monaco-editor@0.37.1/min/'
};

// Let Monaco editor know we're running in a browser environment
self.isInWebWorker = true;