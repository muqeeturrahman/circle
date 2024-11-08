const { Types } = require("mongoose");

exports.getChatListQuery = (userId) => {
    return [

        {
            $match: {
                lastMessage: { $exists: true },
                users: new Types.ObjectId(userId),
                deletedBy: { $ne: new Types.ObjectId(userId) }
            },
        },

        {
            $lookup: {
                from: "users",
                let: { users: "$users" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $in: ["$_id", "$$users"] },
                                    { $ne: ["$_id", new Types.ObjectId(userId)] },
                                ],
                            },
                        },
                    },
                ],
                as: "chat",
            },
        },
        { $unwind: { path: "$chat", preserveNullAndEmptyArrays: true } },

        // Lookup userProfile
        {
            $lookup: {
                from: "userprofiles",
                localField: "chat.profileId",
                foreignField: "_id",
                as: "userProfile"
            },
        },
        {
            $lookup: {
                from: "orgprofiles",
                localField: "chat.profileId",
                foreignField: "_id",
                as: "organizationProfile"
            },
        },
        {
            $addFields: {
                "chat.profileId": {
                    $cond: {
                        if: { $gt: [{ $size: "$userProfile" }, 0] },
                        then: { $arrayElemAt: ["$userProfile", 0] },
                        else: { $arrayElemAt: ["$organizationProfile", 0] }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "media",
                localField: "chat.profileId.profileImage",
                foreignField: "_id",
                as: "chat.profileId.profileImage"
            }
        },
        {
            $lookup: {
                from: "messages",
                localField: "lastMessage",
                foreignField: "_id",
                as: "lastMessage",
            },
        },
        { $unwind: { path: "$lastMessage", preserveNullAndEmptyArrays: true } },

        {
            $lookup: {
                from: "messages",
                let: { channel: "$channel" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$channel", "$$channel"] }, // Same channel
                                    { $eq: ["$isRead", false] }, // Unread messages
                                    { $ne: ["$sender", new Types.ObjectId(userId)] }, // Not sent by the user
                                ],
                            },
                        },
                    },
                ],
                as: "unreadMessages",
            },
        },
        {
            $addFields: {
                unreadCount: { $size: "$unreadMessages" },
            },
        },
        {
            $project: {
                userProfile: 0,
                organizationProfile: 0,
                profileImage: 0,
                "chat.profileId.__v": 0,
                "chat.profileId.authId": 0,
                "chat.profileId.createdAt": 0,
                "chat.profileId.updatedAt": 0,
                "chat.profileId.bussinessCategory": 0,
                "chat.profileId.longitude": 0,
                "chat.profileId.latitude": 0,
                "chat.profileId.location": 0,
                "chat.profileId.portfolio": 0,
                "chat.profileId.address": 0,
                "chat.profileId.openTime": 0,
                "chat.profileId.closeTime": 0,
                "chat.profileId.gender": 0,
            }
        },
        { $project: { unreadMessages: 0 } },
    ];
};

exports.getMessagesWithPolls = (channelId, loginUser) => {
    return [
        {
            $match: {
                channel: channelId,
                isDeletedForEveryone: false,
                deletedBy: { $nin: [loginUser] }
            }
        },
        {
            $lookup: {
                from: "polls",
                localField: "poll",
                foreignField: "_id",
                as: "poll"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                as: "sender"
            }
        },
        {
            $unwind: {
                path: "$poll",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "services",
                localField: "poll.services",
                foreignField: "_id",
                as: "poll.services"
            }
        },
        {
            $unwind: {
                path: "$poll.services",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$sender"
            }
        },
        {
            $lookup: {
                from: "votepolls",
                let: {
                    pollId: "$poll._id",
                    serviceId: "$poll.services._id"
                },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    {
                                        $eq: ["$poll", "$$pollId"]
                                    },
                                    {
                                        $eq: [
                                            "$serviceId",
                                            "$$serviceId"
                                        ]
                                    }
                                ]
                            }
                        }
                    }
                ],
                as: "poll.services.votes"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "poll.services.votes.user",
                foreignField: "_id",
                as: "poll.services.votes.user"
            }
        },
        {
            $addFields:
            {
                "poll.services.voteCount": {
                    $size: {
                        $ifNull: ["$poll.services.votes.user", []]
                    }
                }
            }
        },
        {
            $unwind: {
                path: "$poll.services.votes.user"
            }
        },
        {
            $lookup: {
                from: "userprofiles",
                localField: "poll.services.votes.user.profileId",
                foreignField: "_id",
                as: "userProfile"
            },
        },
        {
            $lookup: {
                from: "orgprofiles",
                localField: "poll.services.votes.user.profileId",
                foreignField: "_id",
                as: "organizationProfile"
            },
        },

        {
            $addFields: {
                "poll.services.votes.user.profileId": {
                    $cond: {
                        if: { $gt: [{ $size: "$userProfile" }, 0] },
                        then: { $arrayElemAt: ["$userProfile", 0] },
                        else: { $arrayElemAt: ["$organizationProfile", 0] }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "media",
                localField: "poll.services.votes.user.profileId.profileImage",
                foreignField: "_id",
                as: "poll.services.votes.user.profileId.profileImage"
            }
        },
        {
            $lookup: {
                from: "userprofiles",
                localField: "sender.profileId",
                foreignField: "_id",
                as: "senderUserProfile"
            }
        },
        {
            $lookup: {
                from: "orgprofiles",
                localField: "sender.profileId",
                foreignField: "_id",
                as: "senderOrganizationProfile"
            }
        },
        {
            $addFields: {
                "sender.profileId": {
                    $cond: {
                        if: { $gt: [{ $size: "$senderUserProfile" }, 0] },
                        then: { $arrayElemAt: ["$senderUserProfile", 0] },
                        else: { $arrayElemAt: ["$senderOrganizationProfile", 0] }
                    }
                }
            }
        },
        {
            $lookup: {
                from: "media",
                localField: "sender.profileId.profileImage",
                foreignField: "_id",
                as: "sender.profileId.profileImage"
            }
        },
        {
            $project: {
                userProfile: 0,
                organizationProfile: 0,
                senderUserProfile: 0,
                senderOrganizationProfile: 0

            }
        },
    ]
}