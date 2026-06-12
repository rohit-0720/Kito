import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface Song {
  id: string;
  title: string;
  thumbnail: string;
}

interface SearchPanelProps {
  onAddToQueue: (song: Song) => void;
}

export function SearchPanel({ onAddToQueue }: SearchPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Mock YouTube search - in real implementation, this would call YouTube Data API
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock results
    const mockResults: Song[] = [
      {
        id: 'dQw4w9WgXcQ',
        title: `${searchQuery} - Artist 1`,
        thumbnail: `https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg`,
      },
      {
        id: 'L_jWHffIx5E',
        title: `${searchQuery} (Official Video)`,
        thumbnail: `https://img.youtube.com/vi/L_jWHffIx5E/default.jpg`,
      },
      {
        id: '9bZkp7q19f0',
        title: `${searchQuery} - Live Performance`,
        thumbnail: `https://img.youtube.com/vi/9bZkp7q19f0/default.jpg`,
      },
    ];
    
    setSearchResults(mockResults);
    setIsSearching(false);
  };

  return (
    <div className="w-full max-w-sm bg-purple-950/30 backdrop-blur-sm border-2 border-purple-500/30 rounded-lg p-4">
      <h3 className="text-lg font-mono text-purple-300 mb-4">🔍 SEARCH SONGS</h3>
      
      {/* Search Input */}
      <div className="flex gap-2 mb-4">
        <Input
          type="text"
          placeholder="Search YouTube..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="bg-black/30 border-purple-500/50 text-white font-mono"
        />
        <Button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-purple-600 hover:bg-purple-500"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Results */}
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {searchResults.map((song) => (
            <div
              key={song.id}
              className="flex items-center gap-2 p-2 bg-black/20 border border-purple-500/20 rounded hover:bg-purple-900/20 transition-colors"
            >
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-12 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-mono truncate">{song.title}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onAddToQueue(song)}
                className="hover:bg-purple-600/50 shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {searchResults.length === 0 && !isSearching && (
            <div className="text-center text-white/40 font-mono py-8">
              Search for songs to add to queue
            </div>
          )}
          
          {isSearching && (
            <div className="text-center text-purple-300 font-mono py-8">
              Searching...
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
