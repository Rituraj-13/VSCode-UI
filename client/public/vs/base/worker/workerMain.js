// Redirector for Monaco Editor's worker requests
// This file redirects all requests to the Monaco CDN with a specific version

// Import the worker from CDN with a specific version for stability
importScripts('https://unpkg.com/monaco-editor@0.37.1/min/vs/base/worker/workerMain.js');