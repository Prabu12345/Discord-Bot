const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

 const guildSchema = mongoose.Schema({
    _id: ObjectId,
    guildID: String,
    userName: String,
    guildName: String,
    remind: []
 })

 module.exports = mongoose.model('Guild', guildSchema, 'guild');