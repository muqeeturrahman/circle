"use strict";

const { populate } = require("dotenv");
let { Schema, model } = require("mongoose");
const path = require("path");

const PollSchema = new Schema(
    {
        services: [ {type: Schema.Types.ObjectId, ref: "service"}  ],
        user: { type: Schema.Types.ObjectId, ref: "user" }
    },
    { timestamps: true }
);

const pollSchemaModel = model("poll", PollSchema);

// create new OTP
exports.addPoll = (obj) => pollSchemaModel.create(obj);
// find OTP by query
exports.getSinglePoll = (query) => pollSchemaModel.findOne(query)
exports.updatePollById = (query) => pollSchemaModel.findByIdAndUpdate(query)
exports.updatePoll = (query) => pollSchemaModel.findOneAndUpdate(query)


exports.getPollById = (id) => pollSchemaModel.findById(id).populate({ path: "media" }).populate({
    path: "user", populate: {
        path: "profileId", // Specify the fields you want to populate
        model: "orgprofiles", populate: {
            path: "profileImage portfolio"
        }
    }
});


// delete OTP


exports.deleteSinglePoll = (id) => pollSchemaModel.deleteOne({ _id: id })
exports.updatePoll = (id, query) => pollSchemaModel.findByIdAndUpdate(id, query, { new: true })
exports.updatePolls = (obj, query) => pollSchemaModel.updateMany(obj, query)