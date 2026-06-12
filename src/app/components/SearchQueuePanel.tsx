import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Menu } from 'lucide-react';
import { Reorder, AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface Song {
  id: string;
  title: string;
  thumbnail: string;
  instanceId?: string;
}

interface SearchQueuePanelProps {
  onAddToQueue: (song: Song) => void;
  onPlayNow: (song: Song) => void;
}

export function SearchQueuePanel({
  onAddToQueue,
  onPlayNow,
}: SearchQueuePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addedSongId, setAddedSongId] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      const results: Song[] = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error(error);
      toast.error('Failed to search YouTube');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div
      className="w-full max-w-[340px] lg:max-w-[380px] h-[280px] lg:h-[466px] rounded-[24px] lg:rounded-3xl p-3 lg:p-4 flex flex-col overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div className="flex gap-2 mb-4 shrink-0">
            <Input
              type="text"
              placeholder="Search YouTube..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="font-mono text-sm"
              style={{
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(168,85,247,0.35)',
                color: '#fff',
              }}
            />
            <Button
              onClick={handleSearch}
              disabled={isSearching}
              style={{
                background: 'rgba(168,85,247,0.5)',
                border: '1px solid rgba(168,85,247,0.4)',
                color: '#fff',
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 min-h-0 w-full">
            <div className="space-y-2 pb-4">
              {searchResults.map((song) => (
                <div
                  key={song.id}
                  className="group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/10 border border-transparent hover:border-white/5 relative overflow-hidden"
                  onClick={() => {
                    onPlayNow(song);
                    setAddedSongId(song.id);
                    setTimeout(() => setAddedSongId(null), 2000);
                  }}
                >
                  <AnimatePresence>
                    {addedSongId === song.id && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="absolute inset-0 z-10 flex items-center px-4 rounded-xl"
                        style={{
                          background: 'linear-gradient(90deg, rgba(139,92,246,0.95), rgba(76,29,149,0.95))',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <span className="text-sm font-bold tracking-wider font-mono text-white flex items-center gap-2">
                          ✓ Added to Queue
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-12 h-9 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <p className="flex-1 text-sm text-white/90 font-mono truncate min-w-0 group-hover:text-white transition-colors">
                    {song.title}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToQueue(song);
                      setAddedSongId(song.id);
                      setTimeout(() => setAddedSongId(null), 2000);
                    }}
                    className="shrink-0 w-8 h-8"
                    style={{ color: '#a78bfa' }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {searchResults.length === 0 && !isSearching && (
                <div className="text-center font-mono py-12" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  ♪ search for songs to add
                </div>
              )}
              {isSearching && (
                <div className="text-center font-mono py-12" style={{ color: '#a78bfa' }}>
                  searching...
                </div>
              )}
            </div>
          </ScrollArea>
    </div>
  );
}
