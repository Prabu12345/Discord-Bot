const mongoose = require('mongoose');

 const guildSchema = monggoose.Schema({
    _id: mongoose.Schema.Types.Objectid,
    guildID: String,
    guildName: String,
    prefix: String
 })

 module.exports = monggoose.model('Guild', guildSchema, 'guild');