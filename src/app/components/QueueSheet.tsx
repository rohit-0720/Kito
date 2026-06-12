import { useState, useEffect } from 'react';
import { motion, Reorder } from 'motion/react';
import { Play, Menu, Trash2, Shuffle, X } from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface Song {
  id: string;
  title: string;
  thumbnail: string;
  instanceId?: string;
}

interface QueueSheetProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Song[];
  currentIndex: number;
  onReorder: (newQueue: Song[]) => void;
  onRemove: (index: number) => void;
  onPlay: (index: number) => void;
}

export function QueueSheet({
  isOpen,
  onClose,
  queue,
  currentIndex,
  onReorder,
  onRemove,
  onPlay,
}: QueueSheetProps) {
  const [localQueue, setLocalQueue] = useState<Song[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const currentSong = queue[currentIndex];
  // The reorderable part of the queue is everything EXCEPT the currently playing song
  // Actually, wait, standard queues let you reorder upcoming songs.
  // We'll define upcoming songs as songs AFTER the current index.
  const upcomingSongs = queue.slice(currentIndex + 1);

  useEffect(() => {
    if (!isDragging) {
      setLocalQueue(upcomingSongs);
    }
  }, [queue, currentIndex, isDragging]);

  const handleReorder = (newUpcoming: Song[]) => {
    setLocalQueue(newUpcoming);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Reconstruct the full queue:
    // [ ...past songs, current song, ...reordered upcoming songs ]
    const pastSongs = queue.slice(0, currentIndex + 1);
    const newFullQueue = [...pastSongs, ...localQueue];
    onReorder(newFullQueue);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, pointerEvents: 'none' }}
        animate={{ 
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none' 
        }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex flex-col justify-end"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isOpen ? 0 : '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full h-[65vh] rounded-t-[32px] flex flex-col overflow-hidden relative shadow-2xl"
          style={{
            background: 'linear-gradient(180deg, #180b2d 0%, #0d0617 100%)',
            borderTop: '1px solid rgba(192, 132, 252, 0.2)',
            willChange: 'transform'
          }}
          onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="px-6 pt-8 pb-4 shrink-0 relative">
              <button 
                className="absolute top-6 right-6 p-2 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-3xl font-bold text-white mb-1 tracking-tight">Queue</h2>
              <p className="text-white/50 font-mono text-xs">Now playing & upcoming tracks</p>
              <p className="text-white/40 font-mono text-[10px] mt-0.5">Drag to reorder your listening experience</p>
            </div>

            <ScrollArea className="flex-1 min-h-0 w-full px-4">
              {/* Fixed "Now Playing" Row */}
              {currentSong && (
                <div className="mb-4">
                  <div className="px-2 mb-2 text-[10px] font-mono tracking-widest text-pink-400 uppercase">Now Playing</div>
                  <div 
                    className="flex items-center gap-3 p-3 rounded-2xl relative overflow-hidden"
                    style={{
                      background: 'rgba(236,72,153,0.15)',
                      border: '1px solid rgba(236,72,153,0.3)',
                      boxShadow: '0 4px 12px rgba(236,72,153,0.1)'
                    }}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-pink-500 rounded-l-2xl" />
                    <img
                      src={currentSong.thumbnail}
                      alt={currentSong.title}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 shadow-md"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm text-white font-medium font-mono truncate">{currentSong.title}</p>
                      <p className="text-xs font-mono truncate text-pink-300">Kito Session</p>
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center shrink-0 text-pink-400">
                      <Play className="h-5 w-5 fill-current" />
                    </div>
                  </div>
                </div>
              )}

              {/* Rearrangeable Queue List */}
              <div className="px-2 mb-2 text-[10px] font-mono tracking-widest text-purple-400 uppercase mt-2">Next Up</div>
              
              <Reorder.Group axis="y" values={localQueue} onReorder={handleReorder} className="space-y-2 pb-24">
                {localQueue.map((song, index) => {
                  const actualIndex = currentIndex + 1 + index;
                  
                  return (
                    <Reorder.Item
                      key={song.instanceId || `${song.id}-${actualIndex}`}
                      value={song}
                      whileDrag={{ scale: 1.03, opacity: 0.85, boxShadow: "0px 10px 20px rgba(0,0,0,0.5)", zIndex: 50 }}
                      onDragStart={() => setIsDragging(true)}
                      onDragEnd={handleDragEnd}
                      className="group flex items-center gap-3 p-3 rounded-2xl transition-colors cursor-grab active:cursor-grabbing bg-white/5 border border-white/5 hover:bg-white/10"
                      onClick={() => onPlay(actualIndex)}
                    >
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-10 h-10 rounded-lg object-cover shrink-0 opacity-90"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-sm text-white/90 font-medium font-mono truncate">{song.title}</p>
                        <p className="text-xs font-mono truncate text-white/40">Unknown Artist</p>
                      </div>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove(actualIndex);
                        }}
                        className="shrink-0 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: 'rgba(255,100,100,0.6)' }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      <div className="w-8 h-8 flex items-center justify-center shrink-0 text-white/30 hover:text-white/70 transition-colors">
                        <Menu className="h-5 w-5" />
                      </div>
                    </Reorder.Item>
                  );
                })}
                {localQueue.length === 0 && (
                  <div className="text-center font-mono py-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    ♪ No upcoming tracks
                  </div>
                )}
              </Reorder.Group>
            </ScrollArea>

            {/* Footer */}
            <div 
              className="absolute bottom-0 w-full p-4 flex justify-center items-center shrink-0 z-10"
              style={{
                background: 'linear-gradient(to top, rgba(13,6,23,1) 60%, rgba(13,6,23,0) 100%)',
              }}
            >
              <button 
                className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm tracking-wide transition-transform hover:scale-105 active:scale-95"
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <Shuffle className="w-4 h-4 text-purple-400" />
                SHUFFLE
              </button>
            </div>
          </motion.div>
        </motion.div>
    </>
  );
}
