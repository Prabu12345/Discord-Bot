const mongoose = require('mongoose');

const rqString = {
    type: String,
    required: true
}

const remindSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    clientid: rqString,
    content: rqString
})

const name = 'userRemind'

module.exports = mongoose.model[name] || mongoose.model(name, remindSchema, name)