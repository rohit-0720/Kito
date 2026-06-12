import { useState } from 'react';
import { Copy, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string;
  color: string;
}

interface SessionPanelProps {
  sessionId: string;
  users: User[];
  isHost: boolean;
}

export function SessionPanel({ sessionId, users, isHost }: SessionPanelProps) {
  const [copied, setCopied] = useState(false);

  const sessionUrl = `${window.location.origin}?session=${sessionId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionUrl);
    setCopied(true);
    toast.success('Session link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <h3 className="font-mono mb-4 flex items-center gap-2" style={{ color: '#93c5fd' }}>
        <Users className="h-4 w-4" />
        SESSION {isHost && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.4)' }}>HOST</span>}
      </h3>

      {/* Session Link */}
      <div className="mb-5">
        <label className="text-xs font-mono mb-2 block" style={{ color: 'rgba(147,197,253,0.7)' }}>
          share link
        </label>
        <div className="flex gap-2">
          <Input
            type="text"
            value={sessionUrl}
            readOnly
            className="font-mono text-xs"
            style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(59,130,246,0.35)',
              color: 'rgba(255,255,255,0.7)',
            }}
          />
          <Button
            onClick={copyToClipboard}
            style={{
              background: copied ? 'rgba(34,197,94,0.5)' : 'rgba(59,130,246,0.5)',
              border: copied ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(59,130,246,0.4)',
              color: '#fff',
              transition: 'all 0.2s',
            }}
          >
            {copied ? '✓' : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Connected Users */}
      <div>
        <p className="text-xs font-mono mb-3" style={{ color: 'rgba(147,197,253,0.7)' }}>
          listening together ({users.length})
        </p>
        <div className="space-y-2">
          {users.map((user, i) => (
            <div
              key={user.id}
              className="flex items-center gap-3 px-3 py-2 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: user.color, boxShadow: `0 0 6px ${user.color}` }}
              />
              <span className="text-sm font-mono text-white/85 flex-1">{user.name}</span>
              {i === 0 && (
                <span className="text-xs font-mono" style={{ color: 'rgba(147,197,253,0.6)' }}>
                  host
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
