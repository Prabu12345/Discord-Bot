const mongoose = require('mongoose');
const Guild = require('../Guild');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

module.exports = async (client, guild) => {
    guild = new Guild({
        _id: ObjectId,
        guildID: guild.id,
        guildName: guild.name,
    });

    guild.save()
    .then(result => console.log(result))
    .catch(err => console.error(err));

    console.log('I Have Joined a new server')
}