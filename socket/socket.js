const socketIO = require('socket.io');
const { updateUserById } = require('../models/user');

let io;

exports.io = (server) => {
  io = socketIO(server);
  io.on('connection', async (socket) => {
    const userObj = await updateUserById(socket.handshake?.headers?.user_id, { online: true });
    // broadcast to all users except the one who is connected
    socket.broadcast.emit('user-connected', userObj);

    socket.on('disconnect', async () => {
      const userObj = await updateUserById(socket.handshake?.headers?.user_id, { online: false });
      socket.emit('user-disconnected', userObj);
    });
  });
};


exports.notificationCount = ({ count, userId }) => {
  // Emit an event with a unique identifier for the updated message
  io.emit(`notification-count-${userId}`, count);
};

exports.sendMessageIO = (receiver, message) => io.emit(`send-message-${receiver}`, message);

exports.resetChatIO = (chatId, data) => io.emit(`reset-chat-${chatId}`, data);


exports.unSeenMessageCount = (receiver, count) => io.emit(`unseen-messages-count-${receiver}`, count);

exports.unSeenMessageCountChannel = (receiver, count,channel) => io.emit(`unseen-read-count-${receiver}`, {count,channel});

exports.sendRequest = (receiverId, data) => io.emit(`receive-request-${receiverId}`, data)
// exports.chatUnReadCount = (receiver, count) => io.emit(`unseen-chat-count-${receiver}`, count);
// seen message IO
exports.seenMessageIO = (message) => io.emit(`seen-message-${message._id}`, message);
// delete message for both
exports.deleteMessageForAllIO = (message) => io.emit(`delete-for-all-${message?._id}`, message);
// update message for all IO
exports.updateCommentForAllIO = (comment) => {
  // Emit an event with a unique identifier for the updated message
  io.emit(`update-message-for-all-${comment.postId}`, comment);
};
exports.createCommentForAllIO = (comment) => {
  // Emit an event with a unique identifier for the updated message
  io.emit(`create-message-for-all-${comment.postId}`, comment);
};
exports.deleteCommentForAllIO = (comment) => {
  // Emit an event with a unique identifier for the updated message
  io.emit(`delete-message-for-all-${comment}`, comment);
};

exports.sessionUpdates=(sessionid,details)=>{
  io.emit(`session-updates-${sessionid}`, details);
}