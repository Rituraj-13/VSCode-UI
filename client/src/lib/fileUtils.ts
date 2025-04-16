export const downloadFile = async (filename: string, content: string) => {
  try {
    // Check if the File System Access API is available
    if ('showSaveFilePicker' in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'Text Files',
          accept: {
            'text/plain': ['.txt'],
            'text/html': ['.html'],
            'text/css': ['.css'],
            'text/javascript': ['.js'],
            'text/typescript': ['.ts', '.tsx'],
          },
        }],
      });
      
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } else {
      // Fallback for browsers that don't support File System Access API
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error('Error saving file:', err);
    throw err;
  }
};
