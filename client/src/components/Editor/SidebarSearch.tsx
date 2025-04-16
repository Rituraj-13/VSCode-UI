import { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useEditorContext } from "@/context/EditorContext";
import { getFileLanguage } from "@/lib/fileTypes";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Define TreeItem type to match the one in Sidebar.tsx
type TreeItem = {
  name: string;
  isFolder?: boolean;
  isOpen?: boolean;
  children?: TreeItem[];
  icon?: string;
  content?: string;
};

interface SidebarSearchProps {
  treeItems: TreeItem[];
}

export default function SidebarSearch({ treeItems }: SidebarSearchProps) {
  const { openFile, updateFileContent } = useEditorContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [replaceQuery, setReplaceQuery] = useState("");
  const [isCaseSensitive, setIsCaseSensitive] = useState(false);
  const [isWholeWord, setIsWholeWord] = useState(false);
  const [isRegex, setIsRegex] = useState(false);
  const [isPreserveCase, setIsPreserveCase] = useState(false);
  const [isReplaceVisible, setIsReplaceVisible] = useState(true);
  const [searchResults, setSearchResults] = useState<{
    file: TreeItem;
    path: string[];
    matches: {
      line: number;
      text: string;
      matchIndex: number;
      matchLength: number;
    }[];
  }[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  // Set up search debounce for real-time search
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Effect for real-time search as user types
  useEffect(() => {
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (searchQuery.trim()) {
      searchDebounceRef.current = setTimeout(() => {
        handleSearch();
      }, 300); // 300ms debounce delay
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [searchQuery, isCaseSensitive, isWholeWord, isRegex]);

  const toggleFileExpansion = (filePath: string) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(filePath)) {
      newExpanded.delete(filePath);
    } else {
      newExpanded.add(filePath);
    }
    setExpandedFiles(newExpanded);
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    // Build search pattern
    let searchPattern: RegExp;
    try {
      let pattern = searchQuery;
      if (!isRegex) {
        pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      if (isWholeWord) {
        pattern = `\\b${pattern}\\b`;
      }
      searchPattern = new RegExp(pattern, isCaseSensitive ? 'g' : 'gi');
    } catch (error) {
      console.error("Invalid regex pattern:", error);
      return;
    }

    // Deep search in file tree
    const results: typeof searchResults = [];

    const searchInTree = (items: TreeItem[], path: string[] = []) => {
      for (const item of items) {
        if (item.isFolder && item.children) {
          // Search in subdirectories
          searchInTree(item.children, [...path, item.name]);
        } else if (!item.isFolder && item.content) {
          // Search in file content
          const lines = item.content.split('\n');
          const matches: typeof searchResults[0]['matches'] = [];

          lines.forEach((line, lineIndex) => {
            // Use exec in a loop instead of matchAll for compatibility
            let match;
            let lineMatches = [];
            while ((match = searchPattern.exec(line)) !== null) {
              lineMatches.push(match);
            }

            if (lineMatches.length > 0) {
              for (const match of lineMatches) {
                matches.push({
                  line: lineIndex + 1,
                  text: line,
                  matchIndex: match.index || 0,
                  matchLength: match[0].length,
                });
              }
            }
          });

          if (matches.length > 0) {
            results.push({
              file: item,
              path: [...path, item.name],
              matches,
            });
          }
        }
      }
    };

    searchInTree(treeItems);
    setSearchResults(results);

    // Automatically expand all result files
    const newExpanded = new Set<string>();
    results.forEach(result => {
      newExpanded.add(result.path.join('/'));
    });
    setExpandedFiles(newExpanded);
  };

  const handleReplaceAll = () => {
    if (!searchQuery || !searchResults.length) return;

    let filesModified = 0;
    let totalReplacements = 0;

    // Process each file with matches
    searchResults.forEach(result => {
      if (!result.file.content) return;

      let fileContent = result.file.content;

      // Build regex for search and replace
      let searchPattern: RegExp;
      try {
        let pattern = searchQuery;
        if (!isRegex) {
          pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        if (isWholeWord) {
          pattern = `\\b${pattern}\\b`;
        }
        searchPattern = new RegExp(pattern, isCaseSensitive ? 'g' : 'gi');
      } catch (error) {
        console.error("Invalid regex pattern:", error);
        return;
      }

      // Perform the replacement
      let newContent: string;
      if (isPreserveCase) {
        // When preserving case, we need to implement case matching (simplified version)
        newContent = fileContent.replace(searchPattern, (match) => {
          if (match === match.toUpperCase()) {
            return replaceQuery.toUpperCase();
          } else if (match[0] === match[0].toUpperCase()) {
            return replaceQuery.charAt(0).toUpperCase() + replaceQuery.slice(1);
          } else {
            return replaceQuery;
          }
        });
      } else {
        // Simple replacement
        newContent = fileContent.replace(searchPattern, replaceQuery);
      }

      // Only update if content actually changed
      if (newContent !== fileContent) {
        // Count the number of replacements (approximate)
        const matchCount = result.matches.length;
        totalReplacements += matchCount;
        filesModified++;

        // Update the TreeItem's content directly
        result.file.content = newContent;

        // Generate a consistent ID for the file based on its path and name
        // This ensures we can properly update it if it's already open
        const fileId = Math.abs(
          (result.path.join('/') + result.file.name).split('').reduce(
            (hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 0
          )
        );

        // Create a file object for the editor
        const file = {
          id: fileId,
          name: result.file.name,
          content: newContent,
          path: result.path.slice(0, -1).join('/'),
          language: getFileLanguage(result.file.name),
          lastModified: new Date().toISOString()
        };

        // Update the file in the editor context (opens it if not already open)
        openFile(file);

        // Also update the file content if it's already open
        updateFileContent(fileId, newContent);
      }
    });

    // Show a console log for now (in a real implementation, we'd show a toast)
    if (filesModified > 0) {
      console.log(`Replaced ${totalReplacements} occurrences in ${filesModified} files`);

      // Re-run the search to update results with the new content
      // This will refresh the search in the modified files
      setTimeout(() => handleSearch(), 300);
    }
  };

  const highlightMatch = (text: string, matchIndex: number, matchLength: number) => {
    const before = text.substring(0, matchIndex);
    const match = text.substring(matchIndex, matchIndex + matchLength);
    const after = text.substring(matchIndex + matchLength);

    return (
      <>
        {before}
        <span className="bg-yellow-700/30">{match}</span>
        {after}
      </>
    );
  };

  return (
    <div className="search-panel flex flex-col h-full bg-editor-dark select-none">
      <div className="search-header px-2 py-1 text-gray-300 text-xs uppercase">
        Search
      </div>

      <div className="search-row relative px-2 pt-2">
        <Input
          placeholder="Search"
          className="w-full text-sm bg-zinc-900 border-zinc-800 h-7 rounded-none px-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute right-3 top-2.5 flex space-x-1">
          <div
            className={`p-0.5 hover:bg-zinc-700 cursor-pointer group relative`}
            onClick={() => setIsCaseSensitive(!isCaseSensitive)}
          >
            <span className={`text-xs ${isCaseSensitive ? 'text-blue-400' : 'text-gray-400'}`}>
              Aa
            </span>
            <div className="absolute hidden group-hover:block bg-zinc-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap -top-8 left-1/4 transform -translate-x-1/2 z-10">
              Match Case
            </div>
          </div>

          <div
            className={`p-0.5 hover:bg-zinc-700 cursor-pointer group relative`}
            onClick={() => setIsWholeWord(!isWholeWord)}
          >
            <span className={`text-xs ${isWholeWord ? 'text-blue-400' : 'text-gray-400'}`}>
              ab
            </span>
            <div className="absolute hidden group-hover:block bg-zinc-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2 z-10">
              Match Whole Word
            </div>
          </div>
        </div>
      </div>

      <div
        className="group collapse-toggle flex items-center pl-2 py-1 cursor-pointer hover:bg-zinc-800/30"
        onClick={() => setIsReplaceVisible(!isReplaceVisible)}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"
          className={`${isReplaceVisible ? '' : 'transform -rotate-90'} mr-2`}
        >
          <path d="M5.7 13.7L5 13L9.6 8.4L5 3.7L5.7 3L10.7 8L5.7 13.7Z" fill="#E8E8E8" />
        </svg>
        <span className="text-gray-400 text-xs">Replace</span>
      </div>

      {isReplaceVisible && (
        <div className="search-row relative px-2 pt-1 pb-1">
          <Input
            placeholder="Replace"
            className="w-full text-sm bg-zinc-900 border-zinc-800 h-7 rounded-none px-2"
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
          />
          <div className="absolute right-3 top-1.5 flex space-x-1">
            <div
              className={`p-0.5 hover:bg-zinc-700 cursor-pointer group relative`}
              onClick={() => setIsPreserveCase(!isPreserveCase)}
            >
              <span className={`text-xs ${isPreserveCase ? 'text-blue-400' : 'text-gray-400'}`}>
                aA
              </span>
              <div className="absolute hidden group-hover:block bg-zinc-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap -top-8 left-1/2 transform -translate-x-1/2 z-10">
                Preserve Case
              </div>
            </div>

            <div
              className={`p-0.5 hover:bg-zinc-700 cursor-pointer group relative ${(!searchQuery || searchResults.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (searchQuery && searchResults.length > 0) {
                  handleReplaceAll();
                }
              }}
            >
              <span className="text-xs text-gray-400">
                AB
              </span>
              <div className="absolute hidden group-hover:block bg-zinc-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap -top-8 left-1/6 transform -translate-x-1/2 z-10">
                Replace All
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="search-results flex-1 overflow-y-auto">
        <div className="flex items-center px-2 mt-3 mb-1">
          <div className="text-xs text-gray-400 uppercase">
            {searchResults.length > 0
              ? `${searchResults.reduce((acc, file) => acc + file.matches.length, 0)} Results in ${searchResults.length} Files`
              : 'Results'}
          </div>
        </div>

        <div className="search-results-content">
          {searchResults.length === 0 ? (
            <div className="text-xs text-gray-400 px-2 py-1">
              {searchQuery ? 'No results found.' : 'Type to search in files'}
            </div>
          ) : (
            <>
              {searchResults.map((result, fileIndex) => {
                const filePath = result.path.join('/');
                const isExpanded = expandedFiles.has(filePath);

                return (
                  <div key={fileIndex} className="result-file mb-1">
                    <div
                      className="file-header flex items-center py-0.5 px-2 cursor-pointer hover:bg-zinc-800"
                      onClick={() => toggleFileExpansion(filePath)}
                    >
                      {isExpanded ? (
                        <ChevronDown size={14} className="mr-1 text-gray-300" />
                      ) : (
                        <ChevronRight size={14} className="mr-1 text-gray-300" />
                      )}
                      <span className="text-xs text-gray-300">{result.file.name}</span>
                      <span className="text-xs text-gray-500 ml-1">
                        ({result.matches.length} match{result.matches.length !== 1 ? 'es' : ''})
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="file-matches">
                        {result.matches.map((match, matchIndex) => (
                          <div
                            key={matchIndex}
                            className="match pl-7 pr-2 py-0.5 text-xs hover:bg-zinc-800 cursor-pointer"
                            onClick={() => {
                              // Open file at specific line
                              if (result.file.content) {
                                // Generate a consistent ID for the file based on its path and name
                                const fileId = Math.abs(
                                  (result.path.join('/') + result.file.name).split('').reduce(
                                    (hash, char) => (hash * 31 + char.charCodeAt(0)) | 0, 0
                                  )
                                );

                                const file = {
                                  id: fileId,
                                  name: result.file.name,
                                  content: result.file.content,
                                  path: result.path.slice(0, -1).join('/'),
                                  language: getFileLanguage(result.file.name),
                                  lastModified: new Date().toISOString()
                                };
                                openFile(file);
                                // In a real editor, would also scroll to the line
                              }
                            }}
                          >
                            <span className="line-number text-gray-500 mr-1">{match.line}:</span>
                            <span className="text-gray-300">{highlightMatch(match.text, match.matchIndex, match.matchLength)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}