/**
 * Thin wrapper so controllers can emit socket events without importing the
 * whole server.js. initIO() is called once from server.js at startup.
 */
let io = null;

function initIO(server, corsOrigin) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: { origin: corsOrigin, credentials: true },
  });

  io.on('connection', (socket) => {
    // Clients join rooms so we can target notifications:
    //   - `admin` room: all staff/admin dashboards (floor map, queue dashboard)
    //   - `queue:<queueEntryId>` room: a single customer waiting in line
    //   - `customer:<userId>` room: a single logged-in customer
    socket.on('join', (room) => socket.join(room));
    socket.on('leave', (room) => socket.leave(room));
  });

  return io;
}

function getIO() {
  return io; // may be null if sockets aren't initialized (e.g. in tests)
}

module.exports = { initIO, getIO };
