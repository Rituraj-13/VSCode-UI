import { useState, useEffect, useRef, useCallback } from "react";
import { useEditorContext } from "@/context/EditorContext";
import MonacoEditor from "@/components/Editor/MonacoEditor";
import Sidebar from "@/components/Editor/Sidebar";
import MenuBar from "@/components/Editor/MenuBar";
import StatusBar from "@/components/Editor/StatusBar";
import EditorTabs from "@/components/Editor/EditorTabs";
import SearchPanel from "@/components/Editor/SearchPanel";
import Terminal from "@/components/Editor/Terminal";
import HtmlPreview from "@/components/Editor/HtmlPreview";
import { Files, Search, Box, Settings, TerminalSquare, User, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CreateNewItemFn } from '@/components/Editor/Sidebar';
import EmptyState from "./EmptyState";

export default function Editor() {
  const {
    currentFile,
    theme,
    updateFileContent,
    searchVisible,
    search,
    replace,
    replaceAll,
    setActiveTab,
    activeTab,
    toggleTerminal,
    isTerminalOpen,
    terminalHeight,
    setTerminalHeight
  } = useEditorContext();

  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [resizing, setResizing] = useState(false);
  const [terminalResizing, setTerminalResizing] = useState(false);
  const [createNewItemFn, setCreateNewItemFn] = useState<((type: 'file' | 'folder') => void) | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Update when we receive the function from Sidebar
  const handleCreateNewItemRef = useCallback((fn: (type: 'file' | 'folder') => void) => {
    setCreateNewItemFn(() => fn);
  }, []);

  // Handle menu bar actions
  const handleMenuBarCreateItem = useCallback((type: 'file' | 'folder') => {
    // First set explorer tab active when creating from menu
    setActiveTab("explorer");
    // Then call the create function
    if (createNewItemFn) {
      createNewItemFn(type);
    }
  }, [createNewItemFn]);

  // Handle sidebar resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizing) {
        // Offset by 48px for the activity bar
        const newWidth = Math.max(160, Math.min(600, e.clientX - 48));
        setSidebarWidth(newWidth);
      } else if (terminalResizing) {
        const windowHeight = window.innerHeight;
        // Calculate from bottom of screen
        const terminalHeight = Math.max(100, Math.min(500, windowHeight - e.clientY));
        setTerminalHeight(terminalHeight);
      }
    };

    const handleMouseUp = () => {
      setResizing(false);
      setTerminalResizing(false);
    };

    if (resizing || terminalResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizing, terminalResizing, setTerminalHeight]);

  // Add keyboard shortcuts for view actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'e':
            e.preventDefault();
            setActiveTab("explorer");
            break;
          case 'f':
            e.preventDefault();
            setActiveTab("search");
            break;
          case 'g':
            e.preventDefault();
            setActiveTab("git");
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTab]);

  // Add click handler for activity bar buttons
  const handleActivityBarClick = (tab: string) => {
    if (activeTab === tab) {
      setSidebarVisible(false);
      setActiveTab("");
    } else {
      setSidebarVisible(true);
      setActiveTab(tab);
    }
  };

  // Handle double click
  const handleActivityBarDoubleClick = () => {
    setSidebarVisible(false);
    setActiveTab("");
  };

  return (
    <div className={`h-screen flex flex-col overflow-hidden pb-[24px] ${theme === "vs-dark" ? "dark-theme bg-editor-dark text-gray-300" : "light-theme bg-white text-gray-800"}`}>
      <MenuBar onCreateNewItem={handleMenuBarCreateItem} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar */}
        <div className="activity-bar w-12 bg-editor-dark flex flex-col items-center py-2 border-r border-gray-800">
          <Button
            variant="ghost"
            size="icon"
            className={`mb-2 hover:bg-gray-700/50 ${activeTab === "explorer" ? "bg-gray-700/50 text-white" : "text-gray-400"}`}
            onClick={() => handleActivityBarClick("explorer")}
            onDoubleClick={handleActivityBarDoubleClick}
            title="Explorer"
          >
            <Files color="white" size={24} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`mb-2 hover:bg-gray-700/50 ${activeTab === "search" ? "bg-gray-700/50 text-white" : "text-gray-400"}`}
            onClick={() => handleActivityBarClick("search")}
            onDoubleClick={handleActivityBarDoubleClick}
            title="Search"
          >
            <Search color="white" size={24} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`mb-2 hover:bg-gray-700/50 ${activeTab === "git" ? "bg-gray-700/50 text-white" : "text-gray-400"}`}
            onClick={() => handleActivityBarClick("git")}
            onDoubleClick={handleActivityBarDoubleClick}
            title="Source Control"
          >
            <GitBranch color="white" size={24} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className={`mb-2 hover:bg-gray-700/50 ${activeTab === "extensions" ? "bg-gray-700/50 text-white" : "text-gray-400"}`}
            onClick={() => handleActivityBarClick("extensions")}
            onDoubleClick={handleActivityBarDoubleClick}
            title="Extensions"
          >
            <Box color="white" size={24} />
          </Button>

          <div className="flex-grow"></div>

          {/* <Button
            variant="ghost"
            size="icon"
            className={`mb-2 ${activeTab === "settings" ? "bg-gray-700/50" : ""}`}
            onClick={() => setActiveTab("settings")}
            title="Settings"
          >
            <Settings size={24} />
          </Button> */}
          <Button
            variant="ghost"
            size="icon"
            className={`mb-2 hover:bg-gray-700/50 ${activeTab === "" ? "bg-gray-700/50 text-white" : "text-gray-400"}`}
            onClick={() => toggleTerminal()}
            title="Terminal"
          >
            <TerminalSquare color="white" size={24} />
          </Button>
          {/* <Button
            variant="ghost"
            size="icon"
            className="mb-2"
            title="Account"
          >
            <User size={24} />
          </Button> */}
        </div>

        {/* Sidebar section with visibility control */}
        <div
          className={`sidebar flex flex-col border-r border-gray-800 transition-[width] duration-300 overflow-hidden`}
          style={{ width: sidebarVisible ? `${sidebarWidth}px` : '0px' }}
        >
          {sidebarVisible && (
            <Sidebar activeTab={activeTab} onCreateNewItem={handleCreateNewItemRef} />
          )}
        </div>

        {/* Resize Handle */}
        <div
          className="resize-handle w-1 bg-gray-800 cursor-col-resize hover:bg-editor-accent"
          onMouseDown={() => setResizing(true)}
        />

        {/* Editor Area */}
        <div className="editor-area flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <EditorTabs />

          {/* Editor */}
          <div className="flex-1 overflow-hidden relative">
            {currentFile ? (
              currentFile.language === 'html' ? (
                <HtmlPreview content={currentFile.content} />
              ) : (
                <MonacoEditor
                  value={currentFile.content}
                  language={currentFile.language}
                  onChange={(value) =>
                    updateFileContent(currentFile.id, value)
                  }
                  theme={theme}
                />
              )
            ) : (
              // <div className="h-full w-full flex items-center justify-center text-gray-500">
              //   <p>No file is currently open</p>
                // </div>
                <EmptyState />
            )}

            {/* Search Panel (within editor) */}
            <SearchPanel
              isVisible={searchVisible}
              onSearch={search}
              onReplace={replace}
              onReplaceAll={replaceAll}
            />
          </div>

          {/* Terminal Panel */}
          {isTerminalOpen && (
            <>
              <div
                className="terminal-resize-handle h-1 bg-gray-800 cursor-row-resize hover:bg-editor-accent"
                onMouseDown={() => setTerminalResizing(true)}
              />
              <div
                className="terminal-panel bg-gray-900 overflow-hidden"
                style={{ height: `${terminalHeight}px` }}
              >
                <Terminal
                  isVisible={isTerminalOpen}
                  onClose={toggleTerminal}
                  sidebarWidth={sidebarWidth}
                  statusBarHeight={24}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
}
