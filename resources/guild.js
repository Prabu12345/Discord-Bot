const mongoose = require('mongoose');

const rqString = {
    type: String,
    required: true
}

const remindSchema = new mongoose.schema({
    date: {
        type: Date,
        required: true
    },
    clientid: rqString,
    content: rqString
})

const name = 'userRemind'

module.exports = mongoose.module[name] || mongoose.module(name, remindSchema, name)