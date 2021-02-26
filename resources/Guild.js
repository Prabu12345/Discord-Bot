const mongoose = require('mongoose');

 const guildSchema = mongoose.Schema({
    _id: String,
    guildID: String,
    guildName: String,
    messageId: { type: String, required: true },
    emojiRoleMappings: { type: mongoose.Schema.Types.Mixed }
 })

 module.exports = mongoose.model('Guild', guildSchema, 'guild');