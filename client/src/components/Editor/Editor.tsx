import React, { useEffect, useRef } from 'react';
import MonacoEditor from 'react-monaco-editor';
import { useEditorContext } from '../../context/EditorContext';

const Editor = () => {
    const editorRef = useRef(null);
    const { currentFile, updateFile, setCursorPosition } = useEditorContext();

    useEffect(() => {
        if (editorRef.current) {
            const editor = editorRef.current.editor;

            editor.onDidChangeCursorPosition((e) => {
                const position = e.position;
                setCursorPosition({
                    line: position.lineNumber,
                    column: position.column
                });
            });
        }
    }, [editorRef, setCursorPosition]);

    return (
        <MonacoEditor
            ref={editorRef}
            language="javascript"
            theme="vs-dark"
            value={currentFile.content}
            onChange={(newValue) => updateFile(currentFile.id, newValue)}
        />
    );
};

export default Editor;