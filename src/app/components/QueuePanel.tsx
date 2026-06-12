import { Trash2, GripVertical } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface Song {
  id: string;
  title: string;
  thumbnail: string;
}

interface QueuePanelProps {
  queue: Song[];
  currentIndex: number;
  onRemove: (index: number) => void;
  onPlay: (index: number) => void;
}

export function QueuePanel({ queue, currentIndex, onRemove, onPlay }: QueuePanelProps) {
  return (
    <div className="w-full max-w-sm bg-pink-950/30 backdrop-blur-sm border-2 border-pink-500/30 rounded-lg p-4">
      <h3 className="text-lg font-mono text-pink-300 mb-4">📻 QUEUE ({queue.length})</h3>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {queue.map((song, index) => (
            <div
              key={`${song.id}-${index}`}
              className={`flex items-center gap-2 p-2 border rounded transition-colors cursor-pointer ${
                index === currentIndex
                  ? 'bg-pink-600/30 border-pink-400'
                  : 'bg-black/20 border-pink-500/20 hover:bg-pink-900/20'
              }`}
              onClick={() => onPlay(index)}
            >
              <GripVertical className="h-4 w-4 text-white/40 shrink-0" />
              
              <img
                src={song.thumbnail}
                alt={song.title}
                className="w-12 h-12 rounded object-cover shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-mono truncate">{song.title}</p>
                {index === currentIndex && (
                  <p className="text-xs text-pink-300 font-mono">♪ Now Playing</p>
                )}
              </div>
              
              <Button
                size="icon"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(index);
                }}
                className="hover:bg-red-600/50 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          
          {queue.length === 0 && (
            <div className="text-center text-white/40 font-mono py-8">
              Queue is empty. Add some songs!
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
