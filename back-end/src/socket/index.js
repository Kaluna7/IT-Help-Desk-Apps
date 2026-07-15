/** @type {Map<string, { userId: string, userName: string, socketId: string }>} */
const workingLocks = new Map();

export function getWorkingLocks() {
  return Object.fromEntries(workingLocks.entries());
}

export function setupSocket(io) {
  io.on('connection', socket => {
    socket.emit('working:sync', getWorkingLocks());

    socket.on('working:start', payload => {
      const { reportId, userId, userName } = payload || {};
      if (!reportId || !userId || !userName) {
        return;
      }

      const current = workingLocks.get(reportId);
      if (current && current.userId !== userId) {
        socket.emit('working:denied', {
          reportId,
          lockedBy: current,
        });
        return;
      }

      workingLocks.set(reportId, {
        userId,
        userName,
        socketId: socket.id,
      });

      io.emit('working:updated', getWorkingLocks());
    });

    socket.on('working:stop', payload => {
      const { reportId, userId } = payload || {};
      if (!reportId || !userId) {
        return;
      }

      const current = workingLocks.get(reportId);
      if (current && current.userId === userId) {
        workingLocks.delete(reportId);
        io.emit('working:updated', getWorkingLocks());
      }
    });

    socket.on('disconnect', () => {
      let changed = false;
      for (const [reportId, lock] of workingLocks.entries()) {
        if (lock.socketId === socket.id) {
          workingLocks.delete(reportId);
          changed = true;
        }
      }
      if (changed) {
        io.emit('working:updated', getWorkingLocks());
      }
    });
  });
}
