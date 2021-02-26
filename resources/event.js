const fs = require('fs')

async function eventreg(client) {
    fs.readdir('./event/', (err, files) => {
        if (err) return console.error;
        files.forEach(file => {
            if (!file.endsWith('.js')) return;
            const evt = require(`./resources/event/${file}`);
            let evtName = file.split('.')[0];
            console.log(`Loaded event '${evtName}'`);
            client.on(evtName, evt.bind(null, client));
        });
      });
}
module.exports = eventreg