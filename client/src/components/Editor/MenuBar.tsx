import React, { useState, useCallback, useEffect } from 'react';
import { useEditorContext } from '@/context/EditorContext';
import type { CreateNewItemFn } from './Sidebar';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { getFileIcon, getFileLanguage } from "@/lib/fileTypes";
import { downloadFile } from '@/lib/fileUtils';

// Add type for tree items
type TreeItem = {
  name: string;
  isFolder?: boolean;
  children?: TreeItem[];
  content?: string;
};

// Helper function to flatten tree into file list
const getFilesFromTree = (items: TreeItem[], parentPath: string[] = []): Array<{
  id: number;
  name: string;
  path: string;
  content: string;
  language: string;
}> => {
  let files: Array<{
    id: number;
    name: string;
    path: string;
    content: string;
    language: string;
  }> = [];

  items.forEach(item => {
    const currentPath = [...parentPath, item.name];

    if (!item.isFolder && item.content) {
      files.push({
        id: Math.abs(currentPath.join('/').split('').reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 0)),
        name: item.name,
        path: parentPath.join('/'),
        content: item.content,
        language: getFileLanguage(item.name)
      });
    } else if (item.children) {
      files = [...files, ...getFilesFromTree(item.children, currentPath)];
    }
  });

  return files;
};

interface MenuBarProps {
  onCreateNewItem?: (type: 'file' | 'folder') => void;
}

export default function MenuBar({ onCreateNewItem }: MenuBarProps) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const [showCommandPalette, setShowCommandPalette] = React.useState(false);
  // Add toggleTerminal to destructured props
  const { editor, openFile, setActiveTab, files, projectStructure, currentFile, saveFile, toggleTerminal } = useEditorContext();
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);

  const handleSave = () => {
    if (currentFile) {
      saveFile(currentFile.id);
    }
  };

  const handleSaveAs = async () => {
    if (currentFile) {
      // Save the current content state, not any unsaved changes
      await downloadFile(currentFile.name, currentFile.content);
    }
  };

  const handleEditAction = (action: string) => {
    if (!editor) return;

    switch (action) {
      case 'undo':
        editor.trigger('keyboard', 'undo', null);
        break;
      case 'redo':
        editor.trigger('keyboard', 'redo', null);
        break;
      case 'cut':
        editor.trigger('keyboard', 'editor.action.clipboardCutAction', null);
        break;
      case 'copy':
        editor.trigger('keyboard', 'editor.action.clipboardCopyAction', null);
        break;
      case 'paste':
        editor.trigger('keyboard', 'editor.action.clipboardPasteAction', null);
        break;
    }
  };

  const handleViewAction = (action: string) => {
    switch (action) {
      case 'commandPalette':
        setShowCommandPalette(true);
        break;
      case 'explorer':
        setActiveTab("explorer"); // This will now work
        break;
      case 'search':
        setActiveTab("search");
        break;
      case 'sourceControl':
        setActiveTab("git");
        break;
      case 'openTerminal':
        toggleTerminal();
        break;
    }
    // Close the menu after selection
    setActiveMenu(null);
  };

  const menus = {
    File: [
      {
        label: 'New File',
        // shortcut: 'Ctrl+N',
        action: () => onCreateNewItem?.('file')
      },
      {
        label: 'New Folder',
        // shortcut: 'Ctrl+Shift+N',
        action: () => onCreateNewItem?.('folder')
      },
      { type: 'separator' },
      {
        label: 'Save',
        shortcut: 'Ctrl+S',
        action: handleSave
      },
      {
        label: 'Save As...',
        shortcut: 'Ctrl+Shift+S',
        action: handleSaveAs
      },
      { type: 'separator' },
      // { label: 'Exit', shortcut: 'Alt+F4' }
    ],
    Edit: [
      {
        label: 'Undo',
        shortcut: 'Ctrl+Z',
        action: () => handleEditAction('undo')
      },
      {
        label: 'Redo',
        shortcut: 'Ctrl+Y',
        action: () => handleEditAction('redo')
      },
      { type: 'separator' },
      {
        label: 'Cut',
        shortcut: 'Ctrl+X',
        action: () => handleEditAction('cut')
      },
      {
        label: 'Copy',
        shortcut: 'Ctrl+C',
        action: () => handleEditAction('copy')
      },
      {
        label: 'Paste',
        shortcut: 'Ctrl+V',
        action: () => handleEditAction('paste')
      }
    ],
    View: [
      {
        label: 'Command Palette...',
        shortcut: 'Ctrl+P',
        action: () => handleViewAction('commandPalette')
      },
      { type: 'separator' },
      {
        label: 'Explorer',
        shortcut: 'Ctrl+Shift+E',
        action: () => handleViewAction('explorer')
      },
      {
        label: 'Search',
        shortcut: 'Ctrl+Shift+F',
        action: () => handleViewAction('search')
      },
      {
        label: 'Source Control',
        shortcut: 'Ctrl+Shift+G',
        action: () => handleViewAction('sourceControl')
      }
    ],
    Terminal: [
      {
        label: 'New Terminal',
        shortcut: 'Ctrl+`',
        action: () => handleViewAction('openTerminal')
      }
    ]
  };

  // Get flattened files from tree
  const treeFiles = getFilesFromTree(projectStructure);

  // Add keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveAs();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        toggleTerminal();
      } else if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, toggleTerminal]); // Add toggleTerminal to dependencies

  return (
    <>
      <div className="flex bg-editor-dark border-b border-gray-800 text-gray-300 text-sm select-none">
        {Object.entries(menus).map(([name, items]) => (
          <div
            key={name}
            className="relative"
            onMouseEnter={() => setActiveMenu(name)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className={`px-3 py-1 hover:bg-gray-700/50 cursor-pointer ${activeMenu === name ? 'bg-gray-700/50' : ''}`}>
              {name}
            </div>
            {activeMenu === name && (
              <div className="absolute left-0 top-full bg-[#252526] border border-gray-800 shadow-lg min-w-[200px] z-50">
                {items.map((item, index) => (
                  item.type === 'separator' ? (
                    <div key={index} className="border-t border-gray-800 my-1" />
                  ) : (
                    <div
                      key={index}
                      className="px-3 py-1.5 hover:bg-[#2d2d2d] cursor-pointer flex justify-between items-center group"
                      onClick={() => {
                        item.action?.();
                        setActiveMenu(null);
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && (
                        <span className="text-gray-500 group-hover:text-gray-400 ml-8">{item.shortcut}</span>
                      )}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <CommandDialog
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        className="editor-command-palette"
      >
        <CommandInput
          placeholder="Type to search files..."
          className="border-0 focus:ring-0 px-4 h-10 bg-editor-dark text-gray-200"
        />
        <CommandList className="bg-editor-dark text-gray-200 py-2">
          <CommandEmpty className="px-4 py-2 text-gray-400">No results found.</CommandEmpty>
          <CommandGroup heading="Files" className="px-2">
            {treeFiles.map((file) => {
              const FileIcon = getFileIcon(file.name);
              const handleSelection = () => {
                openFile(file);
                setShowCommandPalette(false);
              };

              return (
                <CommandItem
                  key={file.id}
                  value={file.name} // Search by file name
                  onSelect={handleSelection}
                  className="flex items-center gap-2"
                >
                  <FileIcon size={16} className="text-gray-400" />
                  <span>{file.path ? `${file.path}/${file.name}` : file.name}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
