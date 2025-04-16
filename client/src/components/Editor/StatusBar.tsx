import { useState } from "react";
import {
  GitBranch,
  AlertCircle,
  AlertTriangle,
  Repeat,
  Moon,
  Sun,
  Bell,
  Wifi,
  Cog,
  Smile,
  Lock,
  Wrench,
  FileJson
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEditorContext } from "@/context/EditorContext";

export default function StatusBar() {
  const { currentFile, theme, toggleTheme, cursorPosition } = useEditorContext();
  const [notifications, setNotifications] = useState<boolean>(true);
  const [indentSize, setIndentSize] = useState(2);

  const language = currentFile?.language ?? "plaintext";
  const displayLanguage = language.charAt(0).toUpperCase() + language.slice(1);

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
  };

  const handleSetIndentSize = (size: number) => {
    setIndentSize(size);
  };

  return (
    <div className="status-bar flex items-center px-4 py-1 bg-editor-statusbar-dark text-white text-xs z-[60] fixed bottom-0 left-0 right-0 select-none">
      <div className="flex-1 flex">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-item flex items-center mr-4 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                <GitBranch className="mr-1" size={12} />
                <span>main</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-700 text-white">
              <p>Current Git Branch</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-item flex items-center mr-4 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                <Repeat className="mr-1" size={12} />
                <span>0 ↓ 0 ↑</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-700 text-white">
              <p>Synchronize Changes</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-item flex items-center mr-4 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                <AlertCircle className="mr-1" size={12} />
                <span>0</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-700 text-white">
              <p>No Errors</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-item flex items-center mr-4 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                <AlertTriangle className="mr-1" size={12} />
                <span>0</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-700 text-white">
              <p>No Warnings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-item flex items-center mx-1 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                <span>{`Ln ${cursorPosition.line}, Col ${cursorPosition.column}`}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-700 text-white">
              <p>Go to Line/Column</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <div className="status-item flex items-center mx-1 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                    <span>Spaces: {indentSize}</span>
                  </div>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border-gray-700 text-white">
                <p>Select Indentation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
            <DropdownMenuItem onClick={() => handleSetIndentSize(2)}>
              2 Spaces
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetIndentSize(4)}>
              4 Spaces
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSetIndentSize(8)}>
              8 Spaces
            </DropdownMenuItem>
            <DropdownMenuItem>
              Use Tabs
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-item flex items-center mx-1 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                <span>UTF-8</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-700 text-white">
              <p>Select Encoding</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <div className="status-item flex items-center mx-1 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                    <FileJson className="mr-1" size={12} />
                    <span>{displayLanguage}</span>
                  </div>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-800 border-gray-700 text-white">
                <p>Select Language Mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
            <DropdownMenuItem>
              JavaScript
            </DropdownMenuItem>
            <DropdownMenuItem>
              TypeScript
            </DropdownMenuItem>
            <DropdownMenuItem>
              HTML
            </DropdownMenuItem>
            <DropdownMenuItem>
              CSS
            </DropdownMenuItem>
            <DropdownMenuItem>
              JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="status-item flex items-center mx-1 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer"
                onClick={handleToggleNotifications}
              >
                <Bell size={12} fill={notifications ? "currentColor" : "none"} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-700 text-white">
              <p>{notifications ? "Notifications Enabled" : "Notifications Disabled"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="status-item flex items-center mx-1 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer"
                onClick={toggleTheme}
              >
                {theme === "vs-dark" ? (
                  <Moon size={12} />
                ) : (
                  <Sun size={12} />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-700 text-white">
              <p>Toggle {theme === "vs-dark" ? "Light" : "Dark"} Theme</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="status-item flex items-center mx-1 px-2 py-1 rounded hover:bg-gray-700 cursor-pointer">
                <Cog size={12} />
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-800 border-gray-700 text-white">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
      </div>
    </div>
  );
}
