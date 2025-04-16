import { Box, X } from "lucide-react";
import { useEditorContext } from "@/context/EditorContext";
import { getFileIcon } from "@/lib/fileTypes";

export default function EditorTabs() {
  const {
    openFiles,
    currentFile,
    setCurrentFile,
    closeFile,
  } = useEditorContext();

  if (!openFiles.length) {
    return (
      <div className="tabs-container bg-editor-dark overflow-x-auto flex border-b border-gray-800 h-10 select-none">
        <div className="flex items-center justify-center w-full text-sm text-gray-500">
          No open files
        </div>
      </div>
    );
  }

  return (
    <div className="tabs-container bg-editor-dark border-b border-gray-800 relative select-none">
      <div className="tabs flex overflow-x-auto thin-scrollbar whitespace-nowrap" style={{ paddingBottom: '2px' }}>
        {openFiles.map((file) => {
          const isActive = currentFile?.id === file.id;
          const Icon = file.name.startsWith('Extension:') ? Box : getFileIcon(file.name);

          return (
            <div
              key={file.id}
              className={`tab min-w-fit h-9 px-3 flex items-center gap-2 text-sm cursor-pointer select-none ${isActive
                ? "active bg-editor-dark after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 k"
                : "bg-editor-sidebar-dark hover:bg-editor-dark/70"
                }`}
              onClick={() => setCurrentFile(file)}
            >
              <Icon className="flex-shrink-0" size={16} />
              <div className="relative flex items-center">
                <span className="truncate max-w-[160px]">{file.name}</span>
                {file.isDirty && (
                  <div className="absolute -right-3 top-[50%] -translate-y-1/2 w-[6px] h-[6px] rounded-full bg-white opacity-80" />
                )}
              </div>
              <button
                className="ml-3 p-0.5 text-gray-500 hover:text-white rounded-sm hover:bg-gray-700/50"
                onClick={(e) => {
                  e.stopPropagation();
                  closeFile(file.id);
                }}
                aria-label={`Close ${file.name}`}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
