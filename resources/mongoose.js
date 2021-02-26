const mongoose = require('mongoose');

module.exports = {
    init: () => {
        const dbOptions = {
            useNewurlParser: true,
            useUnifiedTopology: true,
        };

        mongoose.connect('mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority', dbOptions);
        mongoose.set('useFindAndModify', false);
        mongoose.Promise = global.Promise;

        mongoose.connection.on('connected', () => {
            console.log('mongoose berhasil terhubung!');
        });

        mongoose.connection.on('err', err => {
            console.error(`Mongoose Connection error: \n${err.stack}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('Mongoose connection lost');
        });
    }
}