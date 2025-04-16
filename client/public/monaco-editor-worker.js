/**
 * Basic worker for Monaco Editor
 * This provides a fallback implementation for Monaco Editor's workers
 */
self.MonacoEnvironment = {
  baseUrl: '/vs'
};

// Use local worker files instead of CDN for better reliability
importScripts('/vs/base/worker/workerMain.js');