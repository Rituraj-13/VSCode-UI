export const downloadFile = async (filename: string, content: string) => {
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: filename,
            types: [{
                description: 'Text Files',
                accept: {
                    'text/plain': ['.txt'],
                    'text/html': ['.html', '.htm'],
                    'text/css': ['.css'],
                    'text/javascript': ['.js'],
                    'text/markdown': ['.md'],
                    'application/json': ['.json'],
                    'text/typescript': ['.ts', '.tsx']
                }
            }]
        });

        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
    } catch (err) {
        // User cancelled or browser doesn't support the API
        console.log('File save cancelled or not supported');
    }
};
