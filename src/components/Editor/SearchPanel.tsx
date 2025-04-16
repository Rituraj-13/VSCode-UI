import { useState, useEffect } from "react";
import { 
  Search, 
  CaseSensitive,
  Asterisk, 
  ChevronsUpDown,
  X,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useEditorContext } from "@/context/EditorContext";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SearchPanelProps {
  isVisible: boolean;
  onSearch: (searchText: string, replaceText: string) => void;
  onReplace: (searchText: string, replaceText: string) => void;
  onReplaceAll: (searchText: string, replaceText: string) => void;
}

export default function SearchPanel({
  isVisible,
  onSearch,
  onReplace,
  onReplaceAll,
}: SearchPanelProps) {
  const { currentFile, toggleSearch } = useEditorContext();
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);

  // Handle search
  const handleSearch = () => {
    if (!searchText || !currentFile) {
      setMatchCount(0);
      setSearchResults([]);
      return;
    }
    
    try {
      // Calculate line numbers for matches
      const lines = currentFile.content.split('\n');
      const matches: number[] = [];
      let count = 0;
      
      // Build regex based on search options
      let flags = 'g';
      if (!caseSensitive) flags += 'i';
      
      let searchPattern = searchText;
      
      if (!useRegex) {
        // Escape regex special characters if not using regex mode
        searchPattern = searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      
      if (wholeWord) {
        searchPattern = `\\b${searchPattern}\\b`;
      }
      
      const regex = new RegExp(searchPattern, flags);
      
      // Find matches in each line
      lines.forEach((line, index) => {
        const lineMatches = line.match(regex);
        if (lineMatches) {
          count += lineMatches.length;
          matches.push(index + 1); // Line numbers are 1-based
        }
      });
      
      setMatchCount(count);
      setSearchResults(matches);
      setCurrentMatch(matches.length > 0 ? 1 : 0);
      
      // Call parent search handler
      onSearch(searchText, replaceText);
    } catch (error) {
      console.error("Search error:", error);
      setMatchCount(0);
      setSearchResults([]);
    }
  };

  // Update search when text or options change
  useEffect(() => {
    if (isVisible && searchText) {
      handleSearch();
    }
  }, [searchText, caseSensitive, wholeWord, useRegex, currentFile]);

  // Focus search input when panel becomes visible
  useEffect(() => {
    if (isVisible) {
      const searchInput = document.getElementById("search-input");
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [isVisible]);

  const handleNextMatch = () => {
    if (searchResults.length > 0) {
      setCurrentMatch(prev => (prev < searchResults.length ? prev + 1 : 1));
      // In a real implementation, would scroll to the next match in the editor
    }
  };

  const handlePrevMatch = () => {
    if (searchResults.length > 0) {
      setCurrentMatch(prev => (prev > 1 ? prev - 1 : searchResults.length));
      // In a real implementation, would scroll to the previous match in the editor
    }
  };

  const performReplace = () => {
    if (searchText && replaceText) {
      onReplace(searchText, replaceText);
      // After replace, re-run search to update counts
      handleSearch();
    }
  };

  const performReplaceAll = () => {
    if (searchText && matchCount > 0) {
      onReplaceAll(searchText, replaceText);
      // After replace all, clear search results as they're no longer valid
      setSearchResults([]);
      setMatchCount(0);
      setCurrentMatch(0);
    }
  };

  if (!isVisible) return null;

  return (
    <></>
  );
}
