import { motion } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Volume1, Volume2 } from 'lucide-react';
import { MarqueeText } from './ui/marquee-text';

interface VinylPlayerProps {
  isPlaying: boolean;
  currentSong?: {
    title: string;
    thumbnail: string;
  };
  volume: number;
  currentTime: number;
  duration: number;
  onVolumeChange: (v: number) => void;
  onSeek: (time: number) => void;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onOpenQueue: () => void;
}

export function VinylPlayer({
  isPlaying,
  currentSong,
  volume,
  currentTime,
  duration,
  onVolumeChange,
  onSeek,
  onPlay,
  onPause,
  onNext,
  onPrevious,
  onOpenQueue,
}: VinylPlayerProps) {
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };
  const glassBtn: React.CSSProperties = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderRadius: '50%',
    color: '#e9d5ff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  };

  return (
    <div
      className="flex flex-col items-center gap-4 lg:gap-6 rounded-[24px] lg:rounded-3xl p-5 pb-6 lg:p-8 lg:pb-10 w-full max-w-[340px] lg:max-w-[380px] relative"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.13)',
        boxShadow: '0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)',
      }}
    >
      {/* Vinyl Disc */}
      <div className="relative">
        <div
          className="w-52 h-52 rounded-full p-1 shadow-2xl"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 0 60px rgba(168,85,247,0.2), 0 0 120px rgba(236,72,153,0.1)',
          }}
        >
          <motion.div
            className="w-full h-full rounded-full relative overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #1a1a2e, #0d0d1a)',
            }}
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 3, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
          >
            {/* Vinyl grooves */}
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  top: `${8 + i * 11}%`,
                  left: `${8 + i * 11}%`,
                  right: `${8 + i * 11}%`,
                  bottom: `${8 + i * 11}%`,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              />
            ))}

            {/* Center label */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full overflow-hidden"
              style={{ border: '2px solid rgba(255,255,255,0.15)' }}
            >
              {currentSong?.thumbnail ? (
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-2xl"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)' }}
                >
                  ♪
                </div>
              )}
            </div>

            {/* Center hole */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full"
              style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.2)' }}
            />
          </motion.div>
        </div>

        {/* Tonearm */}
        <motion.div
          className="absolute w-1 rounded-full origin-top cursor-pointer group"
          style={{
            top: 8,
            right: 16,
            height: 80,
            background: 'linear-gradient(to bottom, rgba(200,200,220,0.7), rgba(150,150,170,0.5))',
            transformOrigin: 'top center',
            zIndex: 10,
          }}
          animate={{ rotate: isPlaying ? 28 : 5 }}
          transition={{ duration: 0.5 }}
          onClick={isPlaying ? onPause : onPlay}
        >
          {/* Expanded hit area for easier tapping */}
          <div className="absolute -left-5 -right-5 -top-2 -bottom-2" />
          
          <div
            className="absolute -bottom-1.5 -left-1 w-3 h-3 rounded-full transition-colors group-hover:bg-white"
            style={{ background: 'rgba(200,200,220,0.6)' }}
          />
        </motion.div>
      </div>

      {/* Now Playing */}
      <div className="text-center w-full h-[52px] flex flex-col justify-center">
        {currentSong ? (
          <>
            <p className="text-xs font-mono mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              NOW PLAYING
            </p>
            <div className="w-full max-w-[250px] mx-auto text-center px-4">
              <MarqueeText 
                text={currentSong.title} 
                className="font-mono text-white/90 text-sm sm:text-base" 
                speed={30} 
              />
            </div>
          </>
        ) : (
          <p className="text-xs font-mono mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            SEARCH TO PLAY MUSIC
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-5 w-full">
        <div className="flex items-center gap-5">
          <button
            style={{ ...glassBtn, width: 44, height: 44 }}
            onClick={onPrevious}
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            style={{
              ...glassBtn,
              width: 56,
              height: 56,
              background: 'rgba(168,85,247,0.4)',
              border: '1px solid rgba(168,85,247,0.5)',
              boxShadow: '0 0 20px rgba(168,85,247,0.3)',
            }}
            onClick={isPlaying ? onPause : onPlay}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>

          <button
            style={{ ...glassBtn, width: 44, height: 44 }}
            onClick={onNext}
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline Slider */}
        <div className="flex items-center gap-3 w-full mt-2 group pr-16">
          <span className="text-xs font-mono text-white/50 w-9 text-right shrink-0">{formatTime(currentTime)}</span>
          <input 
            type="range" 
            min="0" 
            max={duration || 100} 
            value={currentTime} 
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer outline-none transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-400 [&::-webkit-slider-thumb]:rounded-full [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:bg-purple-400 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none"
            style={{
              background: `linear-gradient(to right, #c084fc ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.1) ${(currentTime / (duration || 1)) * 100}%)`,
            }}
          />
          <span className="text-xs font-mono text-white/50 w-9 shrink-0">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Queue Button - Bottom Right */}
      <button
        onClick={onOpenQueue}
        className="absolute bottom-6 right-6 p-3 rounded-full hover:scale-110 transition-transform z-20 group"
        style={{
          background: 'rgba(236,72,153,0.15)',
          border: '1px solid rgba(236,72,153,0.3)',
          boxShadow: '0 4px 12px rgba(236,72,153,0.2)'
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400 group-hover:text-pink-300">
          <path d="M21 15V6"/>
          <path d="M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/>
          <path d="M12 12H3"/>
          <path d="M16 6H3"/>
          <path d="M12 18H3"/>
        </svg>
      </button>


    </div>
  );
}
