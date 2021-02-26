const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

 const guildSchema = mongoose.Schema({
    _id: ObjectId,
    guildID: String,
    guildName: String,
    messageId: { type: String, required: true },
    emojiRoleMappings: { type: mongoose.Schema.Types.Mixed }
 })

 const MessageModel = module.exports = mongoose.model('Guild', guildSchema, 'guild');