import {
  FileCode,
  FileJson,
  FileText,
  File as FileIcon,
  Code,
  Brush,
  FileBadge,
} from "lucide-react";

// Define the type for icon components from lucide-react
type IconType = typeof FileCode;

interface FileTypeInfo {
  icon: IconType;
  language: string;
}

/**
 * Maps file extensions to their corresponding icons and language identifiers
 */
const FILE_TYPE_MAP: Record<string, FileTypeInfo> = {
  // Web files
  html: { icon: FileCode, language: "html" },
  htm: { icon: FileCode, language: "html" },
  css: { icon: Brush, language: "css" },
  scss: { icon: Brush, language: "scss" },
  less: { icon: Brush, language: "less" },
  js: { icon: FileBadge, language: "javascript" },
  jsx: { icon: FileBadge, language: "javascript" },
  ts: { icon: FileBadge, language: "typescript" },
  tsx: { icon: FileBadge, language: "typescript" },
  
  // Data formats
  json: { icon: FileJson, language: "json" },
  xml: { icon: FileCode, language: "xml" },
  yaml: { icon: FileCode, language: "yaml" },
  yml: { icon: FileCode, language: "yaml" },
  
  // Programming languages
  py: { icon: FileCode, language: "python" },
  java: { icon: FileCode, language: "java" },
  c: { icon: FileCode, language: "c" },
  cpp: { icon: FileCode, language: "cpp" },
  cs: { icon: FileCode, language: "csharp" },
  go: { icon: FileCode, language: "go" },
  rs: { icon: FileCode, language: "rust" },
  php: { icon: FileCode, language: "php" },
  rb: { icon: FileCode, language: "ruby" },
  
  // Markdown and text
  md: { icon: FileText, language: "markdown" },
  txt: { icon: FileText, language: "plaintext" },
  
  // Default
  default: { icon: FileIcon, language: "plaintext" },
};

/**
 * Gets the appropriate icon component for a file based on its extension
 */
export function getFileIcon(filename: string) {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return (FILE_TYPE_MAP[extension] || FILE_TYPE_MAP.default).icon;
}

/**
 * Gets the language identifier for Monaco Editor based on file extension
 */
export function getFileLanguage(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  return (FILE_TYPE_MAP[extension] || FILE_TYPE_MAP.default).language;
}
