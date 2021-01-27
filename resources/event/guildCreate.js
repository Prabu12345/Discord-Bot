const mongoose = require('mongoose');
const Guild = require('../Guild');

module.exports = async (client, guild) => {
    guild = new Guild({
        _id: mongoose.Types.ObjectId(),
        guildID: guild.id,
        guildName: guild.name,
    });

    guild.save()
    .then(result => console.log(result))
    .catch(err => console.error(err));

    console.log('I Have Joined a new server')
}