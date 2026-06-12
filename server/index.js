import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn("YOUTUBE_API_KEY is missing, returning empty results");
      return res.json([]);
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(query)}&type=video&key=${process.env.YOUTUBE_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'YouTube API error');
    }

    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url
    }));
    
    res.json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to search' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for local development
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// In-memory store
const sessions = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', ({ roomId, user }) => {
    socket.join(roomId);
    
    if (!sessions[roomId]) {
      sessions[roomId] = {
        users: [],
        queue: [],
        currentIndex: 0,
        isPlaying: false,
      };
    }
    
    // Add user to session
    const newUser = { id: socket.id, ...user };
    const existingUserIndex = sessions[roomId].users.findIndex(u => u.id === socket.id);
    if (existingUserIndex === -1) {
      sessions[roomId].users.push(newUser);
    } else {
      sessions[roomId].users[existingUserIndex] = newUser;
    }

    // Send full current state to the joining user
    socket.emit('room-state', sessions[roomId]);

    // Also send updated users list to everyone
    io.to(roomId).emit('users-updated', sessions[roomId].users);

    // Save roomId on socket for disconnect handling
    socket.roomId = roomId;
  });

  socket.on('update-queue', ({ roomId, queue, currentIndex }) => {
    if (sessions[roomId]) {
      if (queue) sessions[roomId].queue = queue;
      if (currentIndex !== undefined) sessions[roomId].currentIndex = currentIndex;
      socket.to(roomId).emit('queue-updated', { queue: sessions[roomId].queue, currentIndex: sessions[roomId].currentIndex });
    }
  });

  socket.on('play', ({ roomId }) => {
    if (sessions[roomId]) {
      sessions[roomId].isPlaying = true;
      socket.to(roomId).emit('play');
    }
  });

  socket.on('pause', ({ roomId }) => {
    if (sessions[roomId]) {
      sessions[roomId].isPlaying = false;
      socket.to(roomId).emit('pause');
    }
  });

  socket.on('sync-state', ({ roomId, currentIndex, isPlaying, currentTime }) => {
    if (sessions[roomId]) {
      if (currentIndex !== undefined) sessions[roomId].currentIndex = currentIndex;
      if (isPlaying !== undefined) sessions[roomId].isPlaying = isPlaying;
      if (currentTime !== undefined) sessions[roomId].currentTime = currentTime;
      
      socket.to(roomId).emit('state-synced', { currentIndex, isPlaying, currentTime });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    const roomId = socket.roomId;
    if (roomId && sessions[roomId]) {
      sessions[roomId].users = sessions[roomId].users.filter(u => u.id !== socket.id);
      
      socket.to(roomId).emit('users-updated', sessions[roomId].users);

      // Clean up empty rooms
      if (sessions[roomId].users.length === 0) {
        delete sessions[roomId];
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
