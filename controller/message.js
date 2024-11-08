const { generateResponse, parseBody } = require("../utils");
const {
    createMessage,
    findMessageById,
    findMessages,
    getMessages, // without pagination
    unSeenMessageCountQuery,
    updateMessageById,
    deleteMessageById,
    unSeenMessageCountByChannelQuery
} = require('../models/messageModel');
const { addPoll, getSinglePoll, updatePollById, updatePoll } = require("../models/pollModel")
const { votePoll, getVote, deleteVote } = require("../models/votePoll")
const { STATUS_CODE, NOTIFICATION_TYPE, MESSAGE_TYPE } = require('../utils/constants');
const {
    sendMessageIO,
    seenMessageIO,
    deleteMessageForAllIO,
    unSeenMessageCount,
    unSeenMessageCountChannel,
    chatUnReadCount,
    resetChatIO
} = require('../socket/socket');
const { updateChat, createChat, findChats, findChat, removeChat } = require('../models/chatModel');
const { getChatListQuery, getMessagesWithPolls } = require('../queries/message');
const { sendMessageValidation } = require('../validations/messageValidation');
const { Types } = require('mongoose');
const { createAndSendNotification1 } = require('../models/notificationModel');
const { findUser } = require('../models/user');
const { ChatModel, chatUnSeenCount } = require('../models/chatModel');
const { findBlockUser } = require('../models/blockModel');
const { populateSender } = require("../utils/helper")
const path = require('path');
const { populate } = require('dotenv');
const { channel } = require("diagnostics_channel");
const { generateUniqueID } = require("../utils/helper")
exports.sendMessage = async (req, res, next) => {
    const { receiver, parent, text, channelId, type, serviceId } = parseBody(req.body);
    // const { error } = sendMessageValidation.validate(req.body);
    // if (error) {
    //     return next({
    //         statusCode: STATUS_CODE.UNPROCESSABLE_ENTITY,
    //         message: error.details[0].message
    //     });
    // }
    const sender = req.user.id;
    let media = [];
    if (req.files?.media?.length > 0) {
        req.files?.media.forEach((file) => media.push(`messages/${file?.filename}`));
    }

    try {
        // check if user is blocked
        // const isBlocked = await findBlockUser({
        //     $or: [
        //         { blockId: sender, userId: receiver },
        //         { blockId: receiver, userId: sender }
        //     ],
        // });

        // if (isBlocked) return next({
        //     statusCode: STATUS_CODE.CONTENT_NOT_AVAILABLE,
        //     message: 'Blocked user'
        // });

        // find created channel or create new channel
        // let isChannel = await findChat({
        //     $or: [{ channel: `${sender}-${receiver}` }, { channel: `${receiver}-${sender}` }]
        // });
        console.log("api is hitting");
        let pollId;
        if (type && type === "poll") {
            let poll = await addPoll({ services: serviceId, user: req.user.id });
            pollId = poll._id;
        }


        let isChannel = await findChat({
            channel: channelId
        });



        if (isChannel) {
            if (isChannel.deletedBy) {
                await updateChat({ _id: isChannel?._id }, {
                    $unset: { deletedBy: isChannel.deletedBy }
                });
            }
        }

        let channel;

        const uniqueId = generateUniqueID();
        if (!isChannel) {
            // create chat / new channel
            channel = `${uniqueId}`;
            const chat = await createChat({
                users: [sender, ...receiver],
                channel
            });
        } else channel = isChannel?.channel;

        const messageData = { sender, channel, media, receiver };
        if (parent) {
            messageData.parent = parent;
        }
        if (text) {
            messageData.text = text;
        }


        if (type && type == "poll") {
            messageData.poll = pollId;
            messageData.type = MESSAGE_TYPE.POLL;
        }
        const message = await createMessage(messageData);

        // update last message in chat
        await updateChat({ channel }, { lastMessage: message._id });
        let resetChats = await ResetChatList(sender)
        receiver.map(async (e) => {
            let resetChatsReciever = await ResetChatList(e)
            resetChatIO(e, resetChatsReciever)

        })

        resetChatIO(sender, resetChats)

        if (message) {
            const newMessage = await findMessageById(message._id)
                // .populate({path: "sender", populate:{
                //     path: "ssn_image profileImage"
                // }})
                .populate('parent')

            receiver.map(async (e) => {
                const unSeenMessageCountByChannel = await unSeenMessageCountByChannelQuery(e, channel)

                const receiverCount = await unSeenMessageCountQuery(e)

                console.log('msmsmsms', unSeenMessageCountByChannel)
                sendMessageIO(e, newMessage);

                unSeenMessageCount(e, receiverCount);

                unSeenMessageCountChannel(e, unSeenMessageCountByChannel, channel)
            })

            // const chatUnSeenCountvalue =  chatUnSeenCount(receiver)

            // console.log('hehehehe', chatUnSeenCountvalue)




            // console.log(receiverCount ,"receiverCount")


            // send message socket

            // chatUnReadCount(receiver, chatUnSeenCountvalue)

            // send notification stuff here!
            const senderObject = await findUser({ _id: newMessage?.sender });
            const receiverIds = receiver;
            const type = NOTIFICATION_TYPE.MESSAGE_SENT;
            console.log("this is channel", channel)
            await createAndSendNotification1({ senderObject, receiverIds, type, relatedId: channelId, relatedType: "message" });
            return generateResponse(newMessage, "Message Send successfully", res);
        }
    } catch (error) {
        next(new Error(error.message));
    }
}
const ResetChatList = async (userId) => {

    const page = 1;
    // const searchText = req.query.search_text || null;
    const limit = 100;

    const query = getChatListQuery(userId);
    // if (searchText) {
    //     query.push({
    //         $match: {
    //             "chat.fullName": {
    //                 $regex: searchText,
    //                 $options: "i" // Case-insensitive match
    //             }
    //         }
    //     });
    // }

    try {
        const chats = await findChats({
            query, page, limit, populate: [
                {
                    path: 'sender',
                    //   populate: {
                    //     path: 'ssn_image profileImage',
                    //   },
                },
            ]
        });
        // if (chats?.result?.length === 0 || !chats) {
        //     generateResponse(null, "No chats found", res);
        //     return;
        // }
        return chats
    } catch (error) {
        next(new Error(error.message));
    }
}

exports.getChatList = async (req, res, next) => {
    const userId = req.user.id;
    const page = req.query.page || 1;
    const searchText = req.query.search_text || null;
    const limit = req.query.limit || 10;

    const query = getChatListQuery(userId, searchText);
    if (searchText) {
        query.push({
            $match: {
                "chat.fullName": {
                    $regex: searchText,
                    $options: "i"
                }
            }
        });
    }

    try {
        const chats = await findChats({
            query, page, limit, populate: [
                {
                    path: 'sender',
                    //   populate: {
                    //     path: 'ssn_image profileImage',
                    //   },
                },
            ]
        });
        // if (chats?.result?.length === 0 || !chats) {
        //     generateResponse(null, "No chats found", res);
        //     return;
        // }

        generateResponse(chats, "Chats fetched successfully", res);
    } catch (error) {
        next(new Error(error.message));
    }
}

exports.getMessages = async (req, res, next) => {
    try {
        const { user, channelId } = req.query
        const loginUser = req.user.id


        console.log("loginUser>>>>>", loginUser);

        let query = {
            channel: channelId,
            isRead: false,
            deletedBy: { $nin: loginUser },
            flaggedBy: { $nin: loginUser }

        }
        const messageForSeen = await getMessages(query)


        if (messageForSeen.length > 0) {
            messageForSeen.map(async (e) => {
                const message = await updateMessageById(e._id, { $set: { isRead: true } })
                seenMessageIO(message)
            })


        }
        let Channel = await findChat({
            channel: channelId
        });
        if (Channel.users.length > 0) {
            Channel.users.map(async (e) => {
                let resetChats = await ResetChatList(e._id)
                resetChatIO(e._id, resetChats)

            })


        }
        delete query.sender;
        delete query.isRead;

        const page = req.query.page || 1
        // const limit = req.query.limit || 10
        // let messagesData = await findMessages({
        //     query, page, limit, populate: [
        //         {
        //             path: 'sender'
        //         }
        //     ]
        // })
  
        const limit = req.query.limit || 10;
   
         query = getMessagesWithPolls(channelId,loginUser )
     
        // messagesData = {
        //     ...messagesData
        // }
        const messagesData = await findMessages({
            query, page, limit, populate: [
                {
                    path: 'sender',
                    //   populate: {
                    //     path: 'ssn_image profileImage',
                    //   },
                },
            ]
        });
        generateResponse(messagesData, "Messages fetched successfully", res);

    }
    catch (error) {
        next(new Error(error.message));
    }
}

exports.votePoll = async (req, res, next) => {
    try {
        // votePoll, getVote, deleteVote
        const { poll, serviceId } = req.body
        const user = req.user.id
        const findPoll = await getSinglePoll({ _id: poll })
        if (!findPoll) {
            return next({
                statusCode: STATUS_CODE.NOT_FOUND,
                message: "Poll not found"
            })
        }
            let findVote = await getVote({ poll, serviceId, user })
            if (findVote) {
                const AlreadyVote = await deleteVote({ poll, serviceId, user })
                generateResponse(AlreadyVote, "vote deleted", res);
                return;
            }
            let deleteUserVote = await deleteVote({ poll, user })
            let addVote = await votePoll({ poll, serviceId, user })
            generateResponse(addVote, "vote added", res);
    }
    catch (error) {
        next(new Error(error.message));
    }
}

exports.deleteMessage = async (req, res, next) => {
    try {
        const user = req.user.id
        console.log(user, "user>>>>>>");

        const { messageId } = req.params;
        let message = await findMessageById(messageId)

        message = await updateMessageById(messageId, { $push: { deletedBy: user } })
        if (!message) {
            return next({
                statusCode: STATUS_CODE.INTERNAL_SERVER_ERROR,
                message: "Message deletion failed"
            })
        }
        generateResponse(message, "message deleted", res);
    }
    catch (error) {
        next(new Error(error.message));
    }
}

exports.deleteMessageForEveryOne = async (req, res, next) => {
    const userId = req.user.id
    const { messageId } = req.params
    try {
        let message = await findMessageById(messageId)
        if (!message) return next({
            statusCode: STATUS_CODE.NOT_FOUND,
            message: 'Message not found!'
        });
        if (message?.sender.toString() !== userId) return next({
            statusCode: STATUS_CODE.UNAUTHORIZED,
            message: 'Message owner can only delete the message!'
        })
        message = await updateMessageById(messageId, { $set: { isDeletedForEveryone: true } })
        deleteMessageForAllIO(message)
        generateResponse(message, "message deleted for everyone!", res)
    }
    catch (error) {
        next(new Error(error.message));
    }
}

exports.clearChat = async (req, res, next) => {
    const loginUser = req.user.id
    const { user, channelId } = req.query
    const query = {
        // $or: [
        //     { channel: `${user}-${loginUser}` },
        //     { channel: `${loginUser}-${user}` }
        // ]
        channel: channelId
    }
    try {
        const messages = await getMessages(query)
        if (messages?.length == 0) return next({
            statusCode: STATUS_CODE.NOT_FOUND,
            message: "Message not found!"
        })
        messages.forEach(async (msg) => {
            if (Types.ObjectId.isValid(msg?.deletedBy) && msg?.deletedBy.toString() !== loginUser) {
                await deleteMessageById(msg?._id)
            }
            else {
                await updateMessageById(msg?._id, { $push: { deletedBy: loginUser } })
            }
        })
        generateResponse(null, "clear chat", res)
    }
    catch (error) {
        next(new Error(error.message));
    }
}

// exports.removeChat = async (req, res, next) => {
//     const loginUser = req.user.id
//     const { user } = req.query
//     const query = {
//         $or: [
//             { channel: `${user}-${loginUser}` },
//             { channel: `${loginUser}-${user}` }
//         ]
//     }
//     try {
//         const messages = await getMessages(query)
//         if (messages?.length == 0) return next({
//             statusCode: STATUS_CODE.NOT_FOUND,
//             message: "Message not found"
//         })
//         messages.forEach(async (msg) => {
//             if (Types.ObjectId.isValid(msg?.deletedBy) && msg?.deletedBy.toString() !== loginUser) {
//                 await deleteMessageById(msg?._id)
//             }
//             else {
//                 await updateMessageById(msg?._id, { $set: { deletedBy: loginUser } })
//             }
//         })
//         let chat = await findChat(query)
//         if (Types.ObjectId.isValid(chat?.deletedBy) && chat?.deletedBy.toString() !== loginUser) {
//             chat = await removeChat(chat?._id)
//         }
//         else {
//             chat = await updateChat({ _id: chat?._id }, { $set: { deletedBy: loginUser } })
//         }
//         generateResponse(null, "clear chat", res)
//     }
//     catch (error) {
//         next(new Error(error.message));
//     }
// }
