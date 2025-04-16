import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { getFileLanguage } from "@/lib/fileTypes";
import type { editor as monacoEditor } from 'monaco-editor';
import { projectStructure as initialProjectStructure } from '@/components/Editor/Sidebar';

interface TreeItem {
  id?: number;
  name: string;
  isFolder?: boolean;
  children?: TreeItem[];
  content?: string;
  path?: string;
  language?: string;
}

// Define File type directly in the frontend to avoid backend dependency
export interface File {
  id: number;
  name: string;
  content: string;
  path: string;
  language: string;
  lastModified: string;
  originalContent?: string;
  isDirty?: boolean; // Add this field
}

// Create initial dummy data
const initialFiles: File[] = [
  {
    id: 1,
    name: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Project</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Welcome to My Project</h1>
    <p>This is a sample HTML file</p>
  </div>
  <script src="app.js"></script>
</body>
</html>`,
    path: "/",
    language: "html",
    lastModified: new Date().toISOString()
  },
  {
    id: 2,
    name: "styles.css",
    content: `/* Main Styles */
body {
  font-family: Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  color: #2c3e50;
}`,
    path: "/",
    language: "css",
    lastModified: new Date().toISOString()
  },
  {
    id: 3,
    name: "app.js",
    content: `/**
 * Main JavaScript file
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('App initialized');
  
  // Sample function
  function greet(name) {
    return \`Hello, \${name}!\`;
  }
  
  console.log(greet('World'));
});`,
    path: "/",
    language: "javascript",
    lastModified: new Date().toISOString()
  },
  {
    id: 4,
    name: "README.md",
    content: `# My Project

This is a sample project README file.

## Features
- Feature 1
- Feature 2
- Feature 3

## Getting Started
1. Clone this repository
2. Open in your editor
3. Start coding!`,
    path: "/",
    language: "markdown",
    lastModified: new Date().toISOString()
  }
];

interface EditorContextType {
  files: File[];
  openFiles: File[];
  currentFile: File | null;
  theme: "vs-dark" | "vs-light";
  searchVisible: boolean;
  openFile: (file: File) => void;
  closeFile: (fileId: number) => void;
  setCurrentFile: (file: File) => void;
  updateFileContent: (fileId: number, content: string) => void;
  createFile: (name: string, content: string, path: string) => void;
  toggleTheme: () => void;
  toggleSearch: () => void;
  search: (searchText: string, replaceText: string) => void;
  replace: (searchText: string, replaceText: string) => void;
  replaceAll: (searchText: string, replaceText: string) => void;
  editor: monacoEditor.IStandaloneCodeEditor | null;
  setEditor: (editor: monacoEditor.IStandaloneCodeEditor | null) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  projectStructure: TreeItem[];
  setProjectStructure: (structure: TreeItem[]) => void;
  saveFile: (fileId: number) => void; // Add this
  toggleTerminal: () => void; // Add this
  isTerminalOpen: boolean; // Add this
  terminalHeight: number; // Add this
  setTerminalHeight: (height: number) => void; // Add this
  cursorPosition: { line: number; column: number }; // Add this
  setCursorPosition: (position: { line: number; column: number }) => void; // Add this
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openFiles, setOpenFiles] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [theme, setTheme] = useState<"vs-dark" | "vs-light">("vs-dark");
  const [searchVisible, setSearchVisible] = useState(false);
  const [editor, setEditor] = useState<monacoEditor.IStandaloneCodeEditor | null>(null);
  const [activeTab, setActiveTab] = useState<string>("explorer");
  const [isTerminalOpen, setIsTerminalOpen] = useState(false); // Add this
  const [terminalHeight, setTerminalHeight] = useState(200); // Add this
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 }); // Add this

  // Local state for files
  const [files, setFiles] = useState<File[]>(() => {
    // Initialize from localStorage or use the initial sample files
    const savedFiles = localStorage.getItem('editor_files');
    return savedFiles ? JSON.parse(savedFiles) : initialFiles;
  });

  // Save files to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('editor_files', JSON.stringify(files));
  }, [files]);

  // Handle opening a file
  const openFile = (file: File, forceUpdate = false) => {
    setFiles(prevFiles => {
      const existingFileIndex = prevFiles.findIndex(f => f.id === file.id || f.name === file.name);

      if (existingFileIndex !== -1) {
        if (forceUpdate) {
          const updatedFiles = [...prevFiles];
          updatedFiles[existingFileIndex] = {
            ...file,
            isDirty: false
          };
          return updatedFiles;
        }
        return prevFiles;
      }
      return [...prevFiles, { ...file, isDirty: false }];
    });

    // Update openFiles state
    setOpenFiles(prevOpenFiles => {
      const isAlreadyOpen = prevOpenFiles.some(f => f.id === file.id || f.name === file.name);
      if (!isAlreadyOpen) {
        return [...prevOpenFiles, file];
      }
      return prevOpenFiles;
    });

    // Set as current file
    setCurrentFile(file);
  };

  // Handle closing a file
  const closeFile = useCallback((fileId: number) => {
    setOpenFiles((prev) => prev.filter((file) => file.id !== fileId));

    // If closing the current file, set the current file to the last open file
    if (currentFile?.id === fileId) {
      setCurrentFile((prev) => {
        const remainingFiles = openFiles.filter((file) => file.id !== fileId);
        return remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1] : null;
      });
    }
  }, [openFiles, currentFile]);

  // Update file content (local implementation)
  const updateFileContent = (fileId: number, content: string) => {
    setFiles(prevFiles =>
      prevFiles.map(f =>
        f.id === fileId
          ? { ...f, content, isDirty: true }
          : f
      )
    );
  };

  // Create a new file (local implementation)
  const createFile = useCallback((name: string, content: string, path: string) => {
    const newFile: File = {
      id: Math.max(0, ...files.map(f => f.id)) + 1,
      name,
      content,
      path,
      language: getFileLanguage(name),
      lastModified: new Date().toISOString()
    };

    setFiles(prev => [...prev, newFile]);

    // Automatically open the new file
    setOpenFiles(prev => [...prev, newFile]);
    setCurrentFile(newFile);
  }, [files]);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "vs-dark" ? "vs-light" : "vs-dark"));
  }, []);

  // Toggle search panel
  const toggleSearch = useCallback(() => {
    setSearchVisible((prev) => !prev);
  }, []);

  // Enhanced search, replace and replaceAll functionality
  const search = useCallback((searchText: string, replaceText: string) => {
    if (!currentFile || !searchText) return;

    // For the frontend-only implementation, we'll just highlight the search text
    // In a real implementation, this would use Monaco Editor's search API
    console.log(`Searching for "${searchText}" in ${currentFile.name}`);

    // Count occurrences (simple string search for demonstration)
    const content = currentFile.content;
    const regex = new RegExp(searchText, 'g');
    const matches = content.match(regex);
    const count = matches ? matches.length : 0;

    console.log(`Found ${count} occurrences of "${searchText}"`);

    // In a real implementation, this would trigger Monaco Editor to highlight matches
    // and scroll to the first match
  }, [currentFile]);

  const replace = useCallback((searchText: string, replaceText: string) => {
    if (!currentFile || !searchText) return;

    // For the frontend-only implementation, we'll just replace the first occurrence
    console.log(`Replacing "${searchText}" with "${replaceText}" in ${currentFile.name}`);

    const content = currentFile.content;
    // Replace only the first occurrence
    const newContent = content.replace(searchText, replaceText);

    if (newContent !== content) {
      updateFileContent(currentFile.id, newContent);
      console.log(`Replaced first occurrence of "${searchText}" with "${replaceText}"`);
    } else {
      console.log(`No occurrences of "${searchText}" found to replace`);
    }
  }, [currentFile, updateFileContent]);

  const replaceAll = useCallback((searchText: string, replaceText: string) => {
    if (!currentFile || !searchText) return;

    console.log(`Replacing all "${searchText}" with "${replaceText}" in ${currentFile.name}`);

    const content = currentFile.content;
    // Replace all occurrences using a global regex
    const regex = new RegExp(searchText, 'g');
    const newContent = content.replace(regex, replaceText);

    if (newContent !== content) {
      updateFileContent(currentFile.id, newContent);

      // Count how many replacements were made
      const oldMatches = content.match(regex);
      const count = oldMatches ? oldMatches.length : 0;

      console.log(`Replaced ${count} occurrences of "${searchText}" with "${replaceText}"`);
    } else {
      console.log(`No occurrences of "${searchText}" found to replace`);
    }
  }, [currentFile, updateFileContent]);

  // Add save file functionality
  const saveFile = useCallback((fileId: number) => {
    const updateFile = (file: File) => ({
      ...file,
      isDirty: false,
      originalContent: file.content // Update original content on save
    });

    setFiles(prev =>
      prev.map(file =>
        file.id === fileId ? updateFile(file) : file
      )
    );

    setOpenFiles(prev =>
      prev.map(file =>
        file.id === fileId ? updateFile(file) : file
      )
    );

    if (currentFile?.id === fileId) {
      setCurrentFile(prev =>
        prev ? updateFile(prev) : null
      );
    }
  }, [currentFile]);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F for search
      if (e.ctrlKey && e.key === "f") {
        e.preventDefault();
        toggleSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSearch]);

  // Add project structure state
  const [projectStructure, setProjectStructure] = useState<TreeItem[]>(initialProjectStructure);

  const toggleTerminal = useCallback(() => {
    setIsTerminalOpen(prev => {
      if (!prev) {
        setTerminalHeight(200); // Reset height when opening
      }
      return !prev;
    });
  }, []);

  // Update setCurrentFile to ensure file is in openFiles
  const setCurrentFileWithTracking = useCallback((file: File) => {
    setOpenFiles(prev => {
      if (!prev.some(f => f.id === file.id)) {
        return [...prev, file];
      }
      return prev;
    });
    setCurrentFile(file);
  }, []);

  const contextValue = {
    files,
    openFiles,
    currentFile,
    theme,
    searchVisible,
    openFile,
    closeFile,
    setCurrentFile: setCurrentFileWithTracking, // Update this line
    updateFileContent,
    createFile,
    toggleTheme,
    toggleSearch,
    search,
    replace,
    replaceAll,
    editor,
    setEditor,
    activeTab,
    setActiveTab,
    projectStructure,
    setProjectStructure,
    saveFile,
    toggleTerminal, // Add this
    isTerminalOpen, // Add this
    terminalHeight, // Add this
    setTerminalHeight, // Add this
    cursorPosition, // Add this
    setCursorPosition, // Add this
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export const processTreeItem = (item: TreeItem, parentPath: string[] = []): TreeItem => {
  const currentPath = [...parentPath, item.name];
  
  if (item.isFolder && item.children) {
    return {
      ...item,
      children: item.children.map(child => processTreeItem(child, currentPath))
    };
  }
  
  return {
    ...item,
    path: currentPath.join('/')
  };
};

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error("useEditorContext must be used within an EditorProvider");
  }
  return context;
};