import { useState, useEffect, useRef, useCallback } from "react";
import {
  Folder,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  FileSearch,
  MoreHorizontal,
  GitBranch,
  Box,
  Container,
  PackageCheck,
  Terminal,
  Code2,
  Database,
  Bug,
  Chrome,
  Settings2,
  Boxes,
  RefreshCcw,
  Download,
  Star,
  File,
  FilePlus,
  FolderPlus,
  FolderUp,
  ListCollapse
} from "lucide-react";
import { useEditorContext } from "@/context/EditorContext";
import { getFileIcon, getFileLanguage } from "@/lib/fileTypes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SidebarSearch from "./SidebarSearch";

// Mock extensions data
const extensions = [
  // Installed extensions
  {
    id: 1,
    name: "Auto Rename Tag",
    author: "Jun Han",
    description: "Auto rename paired HTML/XML tag",
    installs: 10.4,
    version: 2.0,
    rating: 4.0,
    loadTime: "68ms",
    isInstalled: true,
    category: "installed"
  },
  {
    id: 2,
    name: "Better Comments",
    author: "Aaron Bond",
    description: "Improve your code commenting by annotating with alert, informational, TODOs, and more!",
    installs: 5.8,
    version: 1.4,
    rating: 4.6,
    loadTime: "27ms",
    isInstalled: true,
    category: "installed"
  },
  // Recommended extensions
  {
    id: 3,
    name: "Dev Containers",
    author: "Microsoft",
    description: "Open any folder or repository inside a Docker container and take advantage of Visual Studio Code's full feature set.",
    installs: "30.4M",
    version: null,
    rating: 4.5,
    isInstalled: false,
    category: "recommended"
  },
  {
    id: 4,
    name: "Docker",
    author: "Microsoft",
    description: "Makes it easy to create, manage, and debug containerized applications.",
    installs: "43.8M",
    version: null,
    rating: 4.5,
    isInstalled: false,
    category: "recommended"
  },
  {
    id: 5,
    name: "npm Intellisense",
    author: "Christian Kohler",
    description: "Visual Studio Code plugin that autocompletes npm modules in import statements.",
    installs: "9.7M",
    version: null,
    rating: 4.5,
    isInstalled: false,
    category: "recommended"
  },
  {
    id: 6,
    name: "Debugger for Firefox",
    author: "Firefox DevTools",
    description: "Debug your web application or browser extension in Firefox.",
    installs: "4.5M",
    version: null,
    rating: 4.5,
    isInstalled: false,
    category: "recommended"
  },
  {
    id: 7,
    name: "ESLint",
    author: "Microsoft",
    description: "Integrates ESLint JavaScript into VS Code.",
    installs: "42.2M",
    version: null,
    rating: 4.5,
    isInstalled: false,
    category: "recommended"
  },
  {
    id: 8,
    name: "Microsoft Edge Tools for VS Code",
    author: "Microsoft",
    description: "Use the Microsoft Edge Tools from within VS Code to see your site's runtime HTML structure, alter its layout, fix styling issues and more.",
    installs: "4.6M",
    version: null,
    rating: 4.0,
    isInstalled: false,
    category: "recommended"
  },
  {
    id: 9,
    name: "SQLTools",
    author: "Matheus Teixeira",
    description: "Connecting users to many of the most commonly used databases.",
    installs: "5.1M",
    version: null,
    rating: 3.5,
    isInstalled: false,
    category: "recommended"
  }
];

// Define setting types
type Setting =
  | { name: string; type: "number"; value: number }
  | { name: string; type: "text"; value: string }
  | { name: string; type: "toggle"; value: boolean }
  | { name: string; type: "select"; value: string; options: string[] };

// Define TreeItem type
type TreeItem = {
  name: string;
  isFolder?: boolean;
  isOpen?: boolean;
  children?: TreeItem[];
  icon?: string;
  content?: string;
};

// Settings configuration structure
const settingsConfig = [
  {
    group: "Editor",
    settings: [
      { name: "Font Size", type: "number", value: 14 },
      { name: "Font Family", type: "text", value: "Consolas, 'Courier New', monospace" },
      { name: "Tab Size", type: "number", value: 2 },
      { name: "Word Wrap", type: "toggle", value: true },
      { name: "Auto Save", type: "toggle", value: true },
    ] as Setting[]
  },
  {
    group: "Appearance",
    settings: [
      { name: "Color Theme", type: "select", value: "Dark", options: ["Dark", "Light"] },
      { name: "Icon Theme", type: "select", value: "VS Code Icons", options: ["VS Code Icons", "Material Icons"] },
      { name: "Show Minimap", type: "toggle", value: true },
      { name: "Show Line Numbers", type: "toggle", value: true },
    ] as Setting[]
  }
];

// Simplified folder structure with fewer files
export const projectStructure: TreeItem[] = [
  {
    name: "src",
    isFolder: true,
    isOpen: true,
    children: [
      {
        name: "index.js",
        isFolder: false,
        icon: "js",
        content: "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport './index.css';\nimport App from './App';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n"
      },
      {
        name: "App.css",
        isFolder: false,
        icon: "css",
        content: ".App {\n  text-align: center;\n}\n\n.App-header {\n  background-color: #282c34;\n  min-height: 100vh;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  font-size: calc(10px + 2vmin);\n  color: white;\n}\n"
      },
      {
        name: "App.jsx",
        isFolder: false,
        icon: "react",
        content: "import React from 'react';\nimport './App.css';\n\nfunction App() {\n  return (\n    <div className=\"App\">\n      <header className=\"App-header\">\n        <h1>Code Editor Example</h1>\n        <p>Edit files in the explorer to get started</p>\n      </header>\n    </div>\n  );\n}\n\nexport default App;"
      }
    ]
  },
  {
    name: "public",
    isFolder: true,
    isOpen: true,
    children: [
      {
        name: "main.css",
        isFolder: false,
        icon: "css",
        content: "/* Global styles */\n:root {\n  --primary-color: #007acc;\n  --secondary-color: #1e1e1e;\n  --text-color: #333;\n  --light-gray: #f5f5f5;\n}\n\n/* Reset defaults */\n* {\n  margin: 0;\n  padding: 0;\n  box-sizing: border-box;\n}\n\nbody {\n  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;\n  line-height: 1.6;\n  color: var(--text-color);\n}\n\n/* Container styles */\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 0 20px;\n}\n\n/* Button styles */\n.button {\n  background-color: var(--primary-color);\n  color: white;\n  padding: 10px 20px;\n  border: none;\n  border-radius: 4px;\n  cursor: pointer;\n  transition: background-color 0.3s;\n}\n\n.button:hover {\n  background-color: #005999;\n}\n\n/* Form styles */\n.form-group {\n  margin-bottom: 20px;\n}\n\n.input {\n  width: 100%;\n  padding: 8px;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n}\n\n/* Responsive grid */\n.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 20px;\n}\n"
      },
    ]
  },
  {
    name: "README.md",
    isFolder: false,
    icon: "markdown",
    content: "# Code Editor Example\n\nThis is a simple code editor built with React.\n\n## Features\n\n- Syntax highlighting\n- File browser\n- Multiple tabs\n- Search and replace\n- Terminal integration\n"
  }
];

interface SidebarProps {
  activeTab: string;
  onCreateNewItem?: (fn: CreateNewItemFn) => void;
}

// Replace the existing getExtensionIcon function with this:
const getExtensionInitial = (extensionName: string, size: number = 48) => {
  const initial = extensionName.charAt(0).toUpperCase();
  const colors = {
    A: "#FF6B6B", B: "#4ECDC4", C: "#45B7D1",
    D: "#96CEB4", E: "#FFEEAD", F: "#D4A5A5",
    G: "#9B59B6", H: "#3498DB", I: "#E67E22",
    J: "#1ABC9C", K: "#34495E", L: "#16A085",
    M: "#27AE60", N: "#2980B9", O: "#8E44AD",
    P: "#2C3E50", Q: "#F1C40F", R: "#E74C3C",
    S: "#95A5A6", T: "#D35400", U: "#C0392B",
    V: "#BDC3C7", W: "#7F8C8D", X: "#55A44E",
    Y: "#A44E55", Z: "#4E55A4"
  };

  const bgColor = colors[initial as keyof typeof colors] || "#666666";

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: bgColor,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontSize: `${size * 0.5}px`,
        fontWeight: 'bold',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
      }}
    >
      {initial}
    </div>
  );
};

// Replace the getExtensionIconSvg function with this:
const getExtensionInitialHtml = (extensionName: string) => {
  const initial = extensionName.charAt(0).toUpperCase();
  const colors = {
    A: "#FF6B6B", B: "#4ECDC4", C: "#45B7D1",
    D: "#96CEB4", E: "#FFEEAD", F: "#D4A5A5",
    G: "#9B59B6", H: "#3498DB", I: "#E67E22",
    J: "#1ABC9C", K: "#34495E", L: "#16A085",
    M: "#27AE60", N: "#2980B9", O: "#8E44AD",
    P: "#2C3E50", Q: "#F1C40F", R: "#E74C3C",
    S: "#95A5A6", T: "#D35400", U: "#C0392B",
    V: "#BDC3C7", W: "#7F8C8D", X: "#55A44E",
    Y: "#A44E55", Z: "#4E55A4"
  };

  const bgColor = colors[initial as keyof typeof colors] || "#666666";

  return `
    <div style="
      width: 128px;
      height: 128px;
      background-color: ${bgColor};
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 64px;
      font-weight: bold;
      font-family: system-ui, -apple-system, sans-serif;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2)
    ">
      ${initial}
    </div>
  `;
};

// Updated getFilteredExtensionsByType function
const getFilteredExtensionsByType = (filter: string) => {
  const dummyExtensions = {
    "Featured": [
      { id: 1001, name: "GitHub Copilot", author: "GitHub", description: "Your AI pair programmer", installs: "10M+", rating: 4.8 },
      { id: 1002, name: "Prettier", author: "Prettier", description: "Code formatter", installs: "32M+", rating: 4.9 },
    ],
    "Most Popular": [
      { id: 2001, name: "Python", author: "Microsoft", description: "IntelliSense for Python", installs: "65M+", rating: 4.7 },
      { id: 2002, name: "Live Server", author: "Ritwick Dey", description: "Launch a local development server", installs: "45M+", rating: 4.8 },
    ],
    "Recently Published": [
      { id: 3001, name: "Tabnine AI", author: "Tabnine", description: "AI-powered code completion", installs: "500K+", rating: 4.6 },
      { id: 3002, name: "GitHub Actions", author: "GitHub", description: "GitHub Actions workflows", installs: "2M+", rating: 4.5 },
    ],
    "AI": [
      { id: 4001, name: "Amazon CodeWhisperer", author: "Amazon", description: "AI code suggestions", installs: "1M+", rating: 4.4 },
      { id: 4002, name: "ChatGPT GPT-4", author: "OpenAI", description: "AI coding assistant", installs: "5M+", rating: 4.7 },
    ],
    "Azure": [
      { id: 5001, name: "Azure Tools", author: "Microsoft", description: "Tools for Azure development", installs: "8M+", rating: 4.5 },
      { id: 5002, name: "Azure Functions", author: "Microsoft", description: "Create Azure functions", installs: "4M+", rating: 4.6 },
    ],
    "Chat": [
      { id: 6001, name: "Live Share", author: "Microsoft", description: "Real-time collaboration", installs: "15M+", rating: 4.7 },
      { id: 6002, name: "Discord Presence", author: "Discord", description: "Discord integration", installs: "2M+", rating: 4.3 },
    ],
    "Data Science": [
      { id: 7001, name: "Jupyter", author: "Microsoft", description: "Jupyter notebook support", installs: "25M+", rating: 4.8 },
      { id: 7002, name: "R Tools", author: "Microsoft", description: "R language support", installs: "3M+", rating: 4.4 },
    ],
    "Debuggers": [
      { id: 8001, name: "Chrome Debugger", author: "Microsoft", description: "Debug in Chrome", installs: "35M+", rating: 4.8 },
      { id: 8002, name: "PHP Debug", author: "Xdebug", description: "PHP debugging", installs: "12M+", rating: 4.6 },
    ],
    "Extension Packs": [
      { id: 9001, name: "React Pack", author: "Microsoft", description: "Essential React extensions", installs: "8M+", rating: 4.7 },
      { id: 9002, name: "PHP Pack", author: "Community", description: "PHP development pack", installs: "5M+", rating: 4.5 },
    ],
    "Updates": [
      { id: 10001, name: "ESLint", author: "Microsoft", description: "Updated with new rules", installs: "42M+", rating: 4.8 },
      { id: 10002, name: "Prettier", author: "Prettier", description: "New formatting options", installs: "32M+", rating: 4.9 },
    ],
    "Built-in": [
      { id: 11001, name: "TypeScript", author: "Microsoft", description: "TypeScript language features", installs: "Built-in", rating: 4.9 },
      { id: 11002, name: "JavaScript", author: "Microsoft", description: "JavaScript language features", installs: "Built-in", rating: 4.9 },
    ],
    "Enabled": [
      { id: 12001, name: "Git Graph", author: "mhutchie", description: "Git visualization", installs: "8M+", rating: 4.8, isInstalled: true },
      { id: 12002, name: "GitLens", author: "GitKraken", description: "Git supercharged", installs: "20M+", rating: 4.9, isInstalled: true },
    ],
    "Disabled": [
      { id: 13001, name: "Ruby", author: "Shopify", description: "Ruby language features", installs: "2M+", rating: 4.3, isInstalled: false },
      { id: 13002, name: "Go", author: "Go Team", description: "Go language support", installs: "6M+", rating: 4.7, isInstalled: false },
    ],
    "Workspace Unsupported": [
      { id: 14001, name: "Remote - SSH", author: "Microsoft", description: "Remote development over SSH", installs: "18M+", rating: 4.7 },
      { id: 14002, name: "Docker", author: "Microsoft", description: "Docker tools", installs: "15M+", rating: 4.6 },
    ],
  };

  // Return extensions for the selected filter, or an empty array if filter doesn't exist
  return (dummyExtensions[filter as keyof typeof dummyExtensions] || []).map(ext => ({
    ...ext,
    category: "filtered",
    version: null,
    description: ext.description || `A powerful extension for ${filter}`,
    isInstalled: ext.isInstalled ?? false
  }));
};

type NewItemType = {
  isVisible: boolean;
  type: 'file' | 'folder' | null;
  parentPath: string[];
};

interface NewItem {
  id: string;
  type: 'file' | 'folder';
  parentPath: string[];
  isEditing: boolean;
}

export default function Sidebar({ activeTab, onCreateNewItem }: SidebarProps) {
  const { openFile, toggleTheme, theme, setFiles, files, currentFile } = useEditorContext();
  const [localExtensions, setLocalExtensions] = useState(extensions);
  const [filteredExtensions, setFilteredExtensions] = useState(extensions);
  const [selectedSettingsTab, setSelectedSettingsTab] = useState("Editor");
  const [projectTitle, setProjectTitle] = useState("EXPLORER: PROJECT");
  const [treeItems, setTreeItems] = useState<TreeItem[]>(projectStructure);
  const [isInstalledCollapsed, setIsInstalledCollapsed] = useState(false);
  const [isRecommendedCollapsed, setIsRecommendedCollapsed] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const filterContainerRef = useRef<HTMLDivElement>(null);
  const [installedExtensions, setInstalledExtensions] = useState<Set<number>>(new Set());
  const [enabledExtensions, setEnabledExtensions] = useState<Set<number>>(new Set());
  const [newItem, setNewItem] = useState<NewItem | null>(null);
  const newItemInputRef = useRef<HTMLInputElement>(null);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);

  // Extension action handlers
  const handleExtensionAction = (type: 'install' | 'uninstall' | 'toggleEnabled', extension: typeof extensions[0], e: React.MouseEvent | MessageEvent) => {
    if ('stopPropagation' in e) {
      e.stopPropagation();
    }

    let updatedExtension = { ...extension };

    switch (type) {
      case 'install':
        updatedExtension = { ...extension, category: "installed", isInstalled: true };
        setInstalledExtensions(prev => {
          const newSet = new Set([...prev, extension.id]);
          return newSet;
        });
        setEnabledExtensions(prev => {
          const newSet = new Set([...prev, extension.id]);
          return newSet;
        });
        break;

      case 'uninstall':
        updatedExtension = { ...extension, category: "recommended", isInstalled: false };
        setInstalledExtensions(prev => {
          const newSet = new Set(prev);
          newSet.delete(extension.id);
          return newSet;
        });
        setEnabledExtensions(prev => {
          const newSet = new Set(prev);
          newSet.delete(extension.id);
          return newSet;
        });
        break;

      case 'toggleEnabled':
        setEnabledExtensions(prev => {
          const newSet = new Set(prev);
          if (prev.has(extension.id)) {
            newSet.delete(extension.id);
          } else {
            newSet.add(extension.id);
          }
          return newSet;
        });
        break;
    }

    // Update local extensions first
    setLocalExtensions(prev =>
      prev.map(ext =>
        ext.id === extension.id ? updatedExtension : ext
      )
    );

    // Force re-render of preview by reopening with updated extension
    // Use setTimeout to ensure state updates have completed
    setTimeout(() => {
      openExtensionDetails(updatedExtension);
    }, 0);
  };

  const handleInstall = (extension: typeof extensions[0], e: React.MouseEvent | MessageEvent) => {
    handleExtensionAction('install', extension, e);
  };

  const handleUninstall = (extension: typeof extensions[0], e: React.MouseEvent | MessageEvent) => {
    handleExtensionAction('uninstall', extension, e);
  };

  const handleToggleEnabled = (extension: typeof extensions[0], e: React.MouseEvent | MessageEvent) => {
    handleExtensionAction('toggleEnabled', extension, e);
  };

  const toggleFolder = (path: string[]) => {
    const toggleNode = (items: TreeItem[], currentPath: string[], targetPath: string[], index: number): TreeItem[] => {
      if (index >= targetPath.length) return items;

      return items.map(item => {
        if (item.name === targetPath[index]) {
          if (index === targetPath.length - 1) {
            // Target node found
            return { ...item, isOpen: !item.isOpen };
          }

          // Continue recursion
          if (item.children) {
            return {
              ...item,
              children: toggleNode(item.children, [...currentPath, item.name], targetPath, index + 1)
            };
          }
        }
        return item;
      });
    };

    setTreeItems(toggleNode(treeItems, [], path, 0));
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  // Search and filter functionality for extensions
  useEffect(() => {
    if (searchQuery.startsWith("@")) {
      // Don't filter when showing category results
      return;
    }

    if (searchQuery && !searchQuery.startsWith("@")) {
      const filtered = localExtensions.filter(ext =>
        ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ext.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExtensions(filtered);
    } else if (selectedFilter === "All") {
      setFilteredExtensions(localExtensions);
    }
  }, [searchQuery, localExtensions, selectedFilter]);

  // Handle filter selection
  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter);
    setShowFilterMenu(false);

    if (filter === "All") {
      setSearchQuery("");
      setFilteredExtensions(localExtensions);
    } else {
      // Get filtered extensions for the selected category
      const filteredResults = getFilteredExtensionsByType(filter);
      setFilteredExtensions(filteredResults.slice(0, 4)); // Limit to 4 extensions
      // Set search query with @ prefix
      setSearchQuery(`@${filter}`);
    }
  };

  // Handle clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSelectedFilter("All");
  };

  // Handle clicking on an extension to open it in the editor
  const openExtensionDetails = (extension: typeof extensions[0]) => {
    const extensionContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      ${theme === 'vs-dark' ? `
        --vscode-foreground: #cccccc;
        --vscode-background: #1e1e1e;
        --vscode-border: #3c3c3c;
        --vscode-button-background: #0e639c;
        --vscode-button-hover: #1177bb;
        --vscode-button-foreground: #ffffff;
        --vscode-widget-background: #252526;
        --vscode-descriptionForeground: #8b949e;
      ` : `
        --vscode-foreground: #333333;
        --vscode-background: #ffffff;
        --vscode-border: #e1e4e8;
        --vscode-button-background: #2ea44f;
        --vscode-button-hover: #3fb45c;
        --vscode-button-foreground: #ffffff;
        --vscode-widget-background: #f6f8fa;
        --vscode-descriptionForeground: #586069;
      `}
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.4;
      color: var(--vscode-foreground);
      background: var(--vscode-background);
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    .extension-header {
      display: flex;
      gap: 2rem;
      padding: 2rem;
      background: var(--vscode-widget-background);
      border-bottom: 1px solid var(--vscode-border);
      margin-bottom: 2rem;
    }
    .extension-icon {
      width: 128px;
      height: 128px;
      background: var(--vscode-widget-background);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--vscode-border);
      overflow: hidden;
    }
    .extension-icon img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .extension-meta {
      flex: 1;
    }
    .extension-title {
      font-size: 2rem;
      font-weight: 600;
      margin: 0 0 0.5rem 0;
    }
    .extension-publisher {
      font-size: 1.1rem;
      color: var(--vscode-descriptionForeground);
      margin: 0 0 1rem 0;
    }
    .extension-stats {
      display: flex;
      gap: 1.5rem;
      font-size: 0.9rem;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 1.5rem;
    }
    .extension-actions {
      display: flex;
      gap: 1rem;
    }
    .button {
      padding: 0.5rem 1rem;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 4px;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    .button:hover {
      background: var(--vscode-button-hover);
    }
    .button-secondary {
      background: transparent;
      border: 1px solid var(--vscode-button-background);
      color: var(--vscode-button-background);
    }
    .button-secondary:hover {
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
    }
    .extension-body {
      padding: 0 2rem;
    }
    .extension-description {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }
    .section {
      margin-bottom: 2.5rem;
    }
    .section-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid var(--vscode-border);
    }
    .feature-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
      list-style: none;
      padding: 0;
    }
    .feature-item {
      padding: 1rem;
      background: var(--vscode-widget-background);
      border-radius: 6px;
      border: 1px solid var(--vscode-border);
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .stat-icon {
      font-size: 1.2rem;
    }
  </style>
  <script>
    function handleButtonClick(type, id) {
      window.parent.postMessage({ type, id }, '*');
    }
  </script>
</head>
<body>
  <div class="container">
    <div class="extension-header">
      <div class="extension-icon">
        ${getExtensionInitialHtml(extension.name)
      }
      </div>
      <div class="extension-meta">
        <h1 class="extension-title">${extension.name}</h1>
        <p class="extension-publisher">${extension.author}</p>
        <div class="extension-stats">
          ${extension.installs ? `
            <div class="stat-item">
              <span class="stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
              </span>
              <span>${extension.installs} installs</span>
            </div>
          ` : ''}
          ${extension.rating ? `
            <div class="stat-item">
              <span class="stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="text-yellow-400">
                  <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2 9.19 8.63 2 9.24L7.46 13.97L5.82 21z"/>
                </svg>
              </span>
              <span>${extension.rating} rating</span>
            </div>
          ` : ''}
          ${extension.version ? `
            <div class="stat-item">
              <span class="stat-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                  <line x1="6" y1="3" x2="6" y2="15"/>
                  <circle cx="18" cy="6" r="3"/>
                  <circle cx="6" cy="18" r="3"/>
                  <path d="M18 9a9 9 0 0 1-9 9"/>
                </svg>
              </span>
              <span>v${extension.version}</span>
            </div>
          ` : ''}
        </div>
        <div class="extension-actions">
          ${extension.isInstalled ? `
            <div class="flex items-center space-x-4">
              <button 
                class="button" 
                onclick="handleButtonClick('toggleEnabled', ${extension.id})"
              >
                ${enabledExtensions.has(extension.id) ? 'Disable' : 'Enable'}
              </button>
              <button 
                class="button button-secondary" 
                onclick="handleButtonClick('uninstall', ${extension.id})"
              >
                Uninstall
              </button>
              <label class="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" checked class="w-4 h-4 rounded border-gray-600 bg-transparent" />
                <span>Auto-update</span>
              </label>
            </div>
          ` : `
            <div class="flex items-center space-x-4">
              <button 
                class="button"
                onclick="handleButtonClick('install', ${extension.id})"
              >
                Install
              </button>
              <label class="flex items-center gap-2 text-sm text-gray-400">
                <input type="checkbox" checked class="w-4 h-4 rounded border-gray-600 bg-transparent" />
                <span>Auto-update</span>
              </label>
            </div>
          `}
        </div>
      </div>
    </div>
    
    <div class="extension-body">
      <div class="section">
        <div class="extension-description">${extension.description}</div>
      </div>
      
      <div class="section">
        <h2 class="section-title">Features</h2>
        <ul class="feature-list">
          <li class="feature-item">
            <strong>Enhanced Productivity</strong>
            <p>Boost your development workflow with smart completions and validations</p>
          </li>
          <li class="feature-item">
            <strong>Real-time Feedback</strong>
            <p>Get instant feedback and syntax validation as you code</p>
          </li>
          <li class="feature-item">
            <strong>Smart Integration</strong>
            <p>Seamlessly integrates with your existing development environment</p>
          </li>
        </ul>
      </div>
      
      <div class="section">
        <h2 class="section-title">Requirements</h2>
        <ul class="feature-list">
          <li class="feature-item">VS Code version 1.60.0 or higher</li>
        </ul>
      </div>
      
      <div class="section">
        <h2 class="section-title">Extension Settings</h2>
        <ul class="feature-list">
          <li class="feature-item">
            <code>${extension.name.toLowerCase().replace(/\s+/g, '.')}.enable</code>
            <p>Enable/disable this extension</p>
          </li>
          <li class="feature-item">
            <code>${extension.name.toLowerCase().replace(/\s+/g, '.')}.configuration</code>
            <p>Configure extension settings</p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`;

    const file = {
      id: Math.abs((extension.name).split('').reduce((hash: number, char: string) => (hash * 31 + char.charCodeAt(0)) | 0, 0)),
      name: `Extension: ${extension.name}`, // Modified this line
      content: extensionContent,
      path: "extensions",
      language: "html",
      lastModified: new Date().toISOString()
    };

    openFile(file);
  };

  // Render a tree item (file or folder)
  const renderTreeItem = (item: TreeItem, path: string[] = [], level: number = 0) => {
    const iconColor = item.isFolder ?
      (item.name === 'src' ? 'text-green-500' : 'text-yellow-500') :
      'text-gray-400';

    const paddingLeft = level * 12 + 4;
    const newPath = [...path, item.name];
    const isSelected = JSON.stringify(newPath) === JSON.stringify(selectedPath);

    if (item.isFolder) {
      return (
        <div key={item.name + path.join('/')} className="folder">
          <div
            className={`flex items-center py-0.5 ${level > 0 ? 'hover:bg-gray-700/20' : ''} cursor-pointer ${isSelected ? 'bg-gray-700/40' : ''}`}
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={(e) => {
              e.stopPropagation();
              toggleFolder(newPath);
              handleItemClick(newPath, true);
            }}
          >
            {item.isOpen ? (
              <ChevronDown className="mr-1 flex-shrink-0" size={16} />
            ) : (
              <ChevronRight className="mr-1 flex-shrink-0" size={16} />
            )}
            <Folder className={`mr-1 flex-shrink-0 ${iconColor}`} size={16} />
            <span className="truncate">{item.name}</span>
          </div>

          {item.isOpen && (
            <div className="child-items">
              {item.children?.map((child) => renderTreeItem(child, newPath, level + 1))}
              {newItem && JSON.stringify(newPath) === JSON.stringify(newItem.parentPath) && (
                <div
                  className="flex items-center py-0.5 bg-gray-700/40"
                  style={{ paddingLeft: `${paddingLeft + 18}px` }}
                >
                  {newItem.type === 'folder' ? (
                    <Folder className="mr-1 flex-shrink-0 text-yellow-500" size={16} />
                  ) : (
                    <File className="mr-1 flex-shrink-0 text-gray-400" size={16} />
                  )}
                  <input
                    ref={newItemInputRef}
                    type="text"
                    className="bg-transparent border-none outline-none text-sm text-gray-200 w-full"
                    placeholder={`Enter ${newItem.type} name...`}
                    onBlur={(e) => handleNewItemComplete(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNewItemComplete(e.currentTarget.value);
                      } else if (e.key === 'Escape') {
                        setNewItem(null);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else {
      // This is a file
      const Icon = getFileIcon(item.name);
      const isSelected = currentFile && currentFile.name === item.name;

      // Add ability to open file with content
      const handleFileClick = () => {
        if (item.content) {
          const file = {
            id: Math.floor(Math.random() * 10000),
            name: item.name,
            content: item.content,
            path: path.join('/'),
            language: getFileLanguage(item.name),
            lastModified: new Date().toISOString()
          };
          openFile(file);
        }
      };

      return (
        <div
          key={item.name + path.join('/')}
          className={`flex items-center py-0.5 ${isSelected ? 'bg-gray-700/40' : 'hover:bg-gray-700/20'} cursor-pointer`}
          style={{ paddingLeft: `${paddingLeft + 18}px` }}
          onClick={(e) => {
            e.stopPropagation();
            handleItemClick(newPath, false);
          }}
        >
          <Icon className="mr-1 flex-shrink-0" size={16} />
          <span className="truncate">{item.name}</span>
        </div>
      );
    }
  };

  const renderExtensionList = () => {
    if (selectedFilter !== "All") {
      return (
        <div>
          <div className="category-header flex items-center justify-between px-4 py-1 border-b border-gray-800">
            <div className="flex items-center">
              <span className="text-xs text-gray-400 uppercase">{selectedFilter.toUpperCase()}</span>
            </div>
            <span className="text-xs text-gray-500">{filteredExtensions.length} of {getFilteredExtensionsByType(selectedFilter).length}</span>
          </div>
          {filteredExtensions.map(extension => (
            <div
              key={extension.id}
              className="extension-item px-4 py-2 border-b border-gray-800 hover:bg-gray-800/20 cursor-pointer"
              onClick={() => openExtensionDetails(extension)}
            >
              <div className="flex items-start">
                <div className="w-10 h-10 mr-3 flex-shrink-0 rounded-md flex items-center justify-center">
                  {getExtensionInitial(extension.name, 40)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm text-gray-200">{extension.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{extension.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{extension.author}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center">
                        {extension.installs && (
                          <span className="text-xs text-gray-500 mr-2">{extension.installs}</span>
                        )}
                        {extension.rating && (
                          <div className="flex items-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21z" fill="#E3BB4F" />
                            </svg>
                            <span className="text-xs text-gray-500 ml-1">{extension.rating}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs bg-slate-800 border-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstall(extension, e);
                        }}
                      >
                        Install
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <>
        <div
          className="category-header flex items-center justify-between px-4 py-1 border-b border-gray-800 cursor-pointer"
          onClick={() => setIsInstalledCollapsed(!isInstalledCollapsed)}
        >
          <div className="flex items-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              className={`text-gray-400 mr-1 ${isInstalledCollapsed ? '' : 'rotate-90'}`}
            >
              <path d="M5.7 13.7L5 13L9.6 8.4L5 3.7L5.7 3L10.7 8L5.7 13.7Z" fill="currentColor" />
            </svg>
            <span className="text-xs text-gray-400 uppercase">INSTALLED</span>
          </div>
          {/* <span className="text-xs text-gray-500">43</span> */}
        </div>

        {!isInstalledCollapsed && (searchQuery ? filteredExtensions.filter(ext => ext.category === "installed") : localExtensions.filter(ext => ext.category === "installed"))
          .map(extension => (
            <div
              key={extension.id}
              className="extension-item px-4 py-2 border-b border-gray-800 hover:bg-gray-800/20 cursor-pointer"
              onClick={() => openExtensionDetails(extension)}
            >
              <div className="flex items-start">
                <div className="w-10 h-10 mr-3 flex-shrink-0 rounded-md flex items-center justify-center">
                  {getExtensionInitial(extension.name, 40)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm text-gray-200">{extension.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{extension.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{extension.author}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

        <div
          className="category-header flex items-center justify-between px-4 py-1 border-t border-b border-gray-800 cursor-pointer"
          onClick={() => setIsRecommendedCollapsed(!isRecommendedCollapsed)}
        >
          <div className="flex items-center">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
              className={`text-gray-400 mr-1 ${isRecommendedCollapsed ? '' : 'rotate-90'}`}
            >
              <path d="M5.7 13.7L5 13L9.6 8.4L5 3.7L5.7 3L10.7 8L5.7 13.7Z" fill="currentColor" />
            </svg>
            <span className="text-xs text-gray-400 uppercase">RECOMMENDED</span>
          </div>
          {/* <span className="text-xs text-gray-500">8</span> */}
        </div>

        {!isRecommendedCollapsed && (searchQuery ? filteredExtensions.filter(ext => ext.category === "recommended") : localExtensions.filter(ext => ext.category === "recommended"))
          .map(extension => (
            <div
              key={extension.id}
              className="extension-item px-4 py-2 border-b border-gray-800 hover:bg-gray-800/20 cursor-pointer"
              onClick={() => openExtensionDetails(extension)}
            >
              <div className="flex items-start">
                <div className="w-10 h-10 mr-3 flex-shrink-0 rounded-md flex items-center justify-center">
                  {getExtensionInitial(extension.name, 40)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm text-gray-200">{extension.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{extension.description}</div>
                      <div className="text-xs text-gray-500 mt-1">{extension.author}</div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <div className="flex items-center">
                        {extension.installs && (
                          <span className="text-xs text-gray-500 mr-2">{extension.installs}</span>
                        )}
                        {extension.rating && (
                          <div className="flex items-center">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" fill="#E3BB4F" />
                            </svg>
                            <span className="text-xs text-gray-500 ml-1">{extension.rating}</span>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs bg-gray-800 border-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInstall(extension, e);
                        }}
                      >
                        Install
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </>
    );
  };

  // Add effect for handling extension actions from preview
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!event.data?.type || !event.data?.id) return;

      const extension = localExtensions.find(ext => ext.id === event.data.id);
      if (!extension) return;

      handleExtensionAction(
        event.data.type as 'install' | 'uninstall' | 'toggleEnabled',
        extension,
        event
      );
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [localExtensions]);

  // Add this handler after other handlers
  const handleCreateNewItem = useCallback((type: 'file' | 'folder') => {
    const id = Math.random().toString(36).substr(2, 9);

    // If no folder is selected or the selected item is a file, create at root
    let targetPath = selectedPath;
    if (!selectedPath.length || !findItemByPath(treeItems, selectedPath)?.isFolder) {
      targetPath = [];
    }

    setNewItem({
      id,
      type,
      parentPath: targetPath,
      isEditing: true
    });
  }, [selectedPath, treeItems]);

  // Export handleCreateNewItem as a ref
  useEffect(() => {
    if (onCreateNewItem) {
      onCreateNewItem(handleCreateNewItem);
    }
  }, [onCreateNewItem, handleCreateNewItem, selectedPath]);

  const handleNewItemComplete = (name: string) => {
    if (!newItem || !name.trim()) {
      setNewItem(null);
      return;
    }

    const insertNewItem = (items: TreeItem[], path: string[]): TreeItem[] => {
      if (path.length === 0) {
        // Create new item at root level or selected folder level
        const newTreeItem: TreeItem = newItem.type === 'folder'
          ? {
            name,
            isFolder: true,
            isOpen: true,
            children: []
          }
          : {
            name,
            isFolder: false,
            content: '',
          };

        // Check if item with same name already exists at this level
        if (items.some(item => item.name === name)) {
          alert(`A ${newItem.type} with this name already exists`);
          return items;
        }

        return [...items, newTreeItem];
      }

      return items.map(item => {
        if (item.name === path[0] && item.isFolder) {
          return {
            ...item,
            isOpen: true,
            children: insertNewItem(item.children || [], path.slice(1))
          };
        }
        return item;
      });
    };

    const newTreeItems = insertNewItem(treeItems, newItem.parentPath);
    setTreeItems(newTreeItems);

    // If creating a file, open it in the editor
    if (newItem.type === 'file') {
      const file = {
        id: Math.floor(Math.random() * 10000),
        name: name,
        content: '',
        path: newItem.parentPath.join('/'),
        language: getFileLanguage(name),
        lastModified: new Date().toISOString()
      };
      openFile(file);
    }

    setNewItem(null);
  };

  // Update click handler for files/folders to set selected path
  const handleItemClick = (path: string[], isFolder: boolean) => {
    setSelectedPath(path);
    if (!isFolder) {
      const item = findItemByPath(treeItems, path);
      if (item && !item.isFolder) {
        const file = {
          id: Math.floor(Math.random() * 10000),
          name: item.name,
          content: item.content || '',
          path: path.slice(0, -1).join('/'),
          language: getFileLanguage(item.name),
          lastModified: new Date().toISOString(),
          isDirty: false // Add this line to explicitly set initial dirty state
        };
        // Always open file to ensure content is updated
        openFile(file, true); // Pass true as second parameter to force update
      }
    }
  };

  // Helper function to find item by path
  const findItemByPath = (items: TreeItem[], path: string[]): TreeItem | null => {
    if (path.length === 0) return null;

    for (const item of items) {
      if (item.name === path[0]) {
        if (path.length === 1) return item;
        if (item.children) {
          return findItemByPath(item.children, path.slice(1));
        }
      }
    }
    return null;
  };

  // Add this effect to focus input when creating new item
  useEffect(() => {
    if (newItem?.isEditing && newItemInputRef.current) {
      newItemInputRef.current.focus();
    }
  }, [newItem?.isEditing]);

  // Add this new function to collapse all folders
  const collapseAllFolders = () => {
    const collapseFolders = (items: TreeItem[]): TreeItem[] => {
      return items.map(item => {
        if (item.isFolder) {
          return {
            ...item,
            isOpen: false,
            children: item.children ? collapseFolders(item.children) : []
          };
        }
        return item;
      });
    };

    setTreeItems(collapseFolders(treeItems));
  };

  // Render the appropriate tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "explorer":
        return (
          <div className="file-explorer flex-1 overflow-y-auto text-sm text-gray-300 bg-editor-dark select-none">
            <div className="header flex justify-between items-center px-4 py-2 border-b border-gray-800">
              <span className="text-xs">{projectTitle}</span>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0"
                  onClick={() => handleCreateNewItem('file')}
                  title="New File"
                >
                  <FilePlus size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0"
                  onClick={() => handleCreateNewItem('folder')}
                  title="New Folder"
                >
                  <FolderPlus size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-6 h-6 p-0"
                  onClick={collapseAllFolders}
                  title="Collapse All Folders"
                >
                  <ListCollapse size={14} />
                </Button>
                {/* <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                  <MoreHorizontal size={14} />
                </Button> */}
              </div>
            </div>

            <div className="files" onClick={() => setSelectedPath([])}>
              {treeItems.map(item => renderTreeItem(item))}
              {newItem && newItem.parentPath.length === 0 && (
                <div
                  className="flex items-center py-0.5 bg-gray-700/40"
                  style={{ paddingLeft: '22px' }}
                >
                  {newItem.type === 'folder' ? (
                    <Folder className="mr-1 flex-shrink-0 text-yellow-500" size={16} />
                  ) : (
                    <File className="mr-1 flex-shrink-0 text-gray-400" size={16} />
                  )}
                  <input
                    ref={newItemInputRef}
                    type="text"
                    className="bg-transparent border-none outline-none text-sm text-gray-200 w-full"
                    placeholder={`Enter ${newItem.type} name...`}
                    onBlur={(e) => handleNewItemComplete(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleNewItemComplete(e.currentTarget.value);
                      } else if (e.key === 'Escape') {
                        setNewItem(null);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );

      case "search":
        return (
          <SidebarSearch treeItems={treeItems} />
        );

      case "git":
        return (
          <div className="git-panel flex flex-col h-full bg-editor-dark select-none">
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-2">SOURCE CONTROL</h3>
              <div className="text-xs text-gray-400">Initialize git repository to enable source control features</div>
              <Button size="sm" className="w-full mt-4 bg-gray-800">Initialize Repository</Button>
            </div>
          </div>
        );

      case "extensions":
        return (
          <div className="extensions-panel flex flex-col h-full bg-editor-dark select-none">
            {/* Header */}
            <div className="header flex justify-between items-center px-4 py-2 border-b border-gray-800">
              <span className="text-gray-200 font-medium">EXTENSIONS</span>
            </div>

            {/* Search Bar */}
            <div className="search-container flex items-center px-4 py-2 border-b border-gray-800">
              <Input
                placeholder="Search Extensions in Marketplace"
                className="text-sm bg-zinc-900 border-zinc-800 h-7 rounded-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="ml-2 flex space-x-1">
                <button
                  className="text-gray-400 hover:text-gray-200"
                  title="Clear Extension Search Results"
                  onClick={clearSearch}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                    <path d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z" fill="currentColor" />
                  </svg>
                </button>
                <div ref={filterContainerRef} className="relative">
                  <button
                    className="text-gray-400 hover:text-gray-200"
                    title="Filter Extensions"
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className="text-gray-400">
                      <path d="M16 4h-16v-2h16v2zm-16 6h5v-2h11v2h-16zm16-4h-8v-2h8v2zm-8 6h8v-2h-8v2z" fill="currentColor" />
                    </svg>
                  </button>

                  {/* Update filter menu positioning */}
                  {showFilterMenu && (
                    <div className="filter-menu absolute z-50 bg-zinc-900 border border-zinc-800 shadow-lg right-0 mt-2" style={{ width: "230px" }}>
                      <div className="p-1.5">
                        {/* Featured, Most Popular, etc. */}
                        <div
                          className="p-1 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() => handleFilterSelect("Featured")}
                        >
                          <div className="font-medium text-xs text-gray-200">Featured</div>
                        </div>
                        <div
                          className="p-1 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() => handleFilterSelect("Most Popular")}
                        >
                          <div className="font-medium text-xs text-gray-200">Most Popular</div>
                        </div>
                        <div
                          className="p-1 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() => handleFilterSelect("Recently Published")}
                        >
                          <div className="font-medium text-xs text-gray-200">Recently Published</div>
                        </div>
                        <div
                          className="p-1 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() => handleFilterSelect("Recommended")}
                        >
                          {/* <div className="font-medium text-xs text-gray-200">Recommended</div> */}
                        </div>

                        {/* Category section */}
                        <div className="flex justify-between items-center border-t border-zinc-800 mt-1.5 pt-1.5">
                          <div className="font-medium text-xs text-gray-200">Category</div>
                          <svg width="14" height="14" viewBox="0 0 16 16" className="text-gray-400">
                            <path d="M5.7 13.7L5 13L9.6 8.4L5 3.7L5.7 3L10.7 8L5.7 13.7Z" fill="currentColor" />
                          </svg>
                        </div>

                        {/* Categories */}
                        <div
                          className="p-1 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() => handleFilterSelect("AI")}
                        >
                          <div className="text-xs text-gray-200">AI</div>
                        </div>
                        <div
                          className="p-1 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() => handleFilterSelect("Azure")}
                        >
                          <div className="text-xs text-gray-200">Azure</div>
                        </div>
                        <div
                          className="p-1 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() => handleFilterSelect("Chat")}
                        >
                          <div className="text-xs text-gray-200">Chat</div>
                        </div>
                        <div
                          className="p-1 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() => handleFilterSelect("Data Science")}
                        >
                          <div className="text-xs text-gray-200">Data Science</div>
                        </div>
                        <div
                          className="p-1 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() => handleFilterSelect("Debuggers")}
                        >
                          <div className="text-xs text-gray-200">Debuggers</div>
                        </div>
                        <div
                          className="p-1 hover:bg-zinc-800/50 cursor-pointer"
                          onClick={() => handleFilterSelect("Extension Packs")}
                        >
                          <div className="text-xs text-gray-200">Extension Packs</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Extension content area */}
            <div className="flex-1 overflow-y-auto">
              {renderExtensionList()}
            </div>
          </div>
        );

      case "settings":
        return (
          <div className="settings-panel flex flex-col h-full bg-editor-dark">
            <div className="settings-header px-4 py-2 border-b border-gray-800">
              <span className="text-xs font-bold">SETTINGS</span>
            </div>

            <div className="settings-container flex h-full">
              <div className="settings-sidebar w-1/3 border-r border-gray-800 p-2">
                {settingsConfig.map(group => (
                  <div
                    key={group.group}
                    className={`p-2 cursor-pointer rounded ${selectedSettingsTab === group.group ? 'bg-gray-800' : 'hover:bg-gray-800/30'}`}
                    onClick={() => setSelectedSettingsTab(group.group)}
                  >
                    <span className="text-xs">{group.group}</span>
                  </div>
                ))}
              </div>

              <div className="settings-content flex-1 p-4 overflow-y-auto">
                <h3 className="text-sm font-bold mb-4">{selectedSettingsTab}</h3>

                {settingsConfig.find(g => g.group === selectedSettingsTab)?.settings.map((setting, idx) => (
                  <div key={idx} className="setting-item mb-4">
                    <div className="text-xs mb-1">{setting.name}</div>
                    {setting.type === 'toggle' && (
                      <div className="flex items-center">
                        <input type="checkbox" defaultChecked={setting.value as boolean} id={`setting-${idx}`} />
                        <label htmlFor={`setting-${idx}`} className="ml-2 text-xs text-gray-400">
                          {setting.value ? 'Enabled' : 'Disabled'}
                        </label>
                      </div>
                    )}
                    {setting.type === 'number' && (
                      <Input type="number" defaultValue={setting.value as number} className="text-xs h-7" />
                    )}
                    {setting.type === 'text' && (
                      <Input type="text" defaultValue={setting.value as string} className="text-xs h-7" />
                    )}
                    {setting.type === 'select' && (
                      <select className="w-full text-xs bg-gray-800 border border-gray-700 rounded p-1">
                        {setting.type === 'select' && 'options' in setting && setting.options.map(option => (
                          <option key={option} selected={option === setting.value}>{option}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}

                {/* {selectedSettingsTab === "Appearance" && (
                  <div className="setting-item mt-6">
                    <Button
                      onClick={handleThemeToggle}
                      className="mt-2"
                    >
                      Toggle Theme ({theme === "vs-dark" ? "Dark" : "Light"})
                    </Button>
                  </div>
                )} */}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // The sidebar no longer contains buttons - they've been moved to activity bar in Editor.tsx
  return (
    <div className="h-full w-full flex flex-col bg-gray-900">
      {renderTabContent()}
    </div>
  );
}

// Export the types and function for external use
export type { SidebarProps };
export type CreateNewItemFn = (type: 'file' | 'folder') => void;