const { oneLine, stripIndents } = require('common-tags');
const permissions = {
	ADMINISTRATOR: 'Administrator',
	VIEW_AUDIT_LOG: 'View audit log',
	MANAGE_GUILD: 'Manage server',
	MANAGE_ROLES: 'Manage roles',
	MANAGE_CHANNELS: 'Manage channels',
	KICK_MEMBERS: 'Kick members',
	BAN_MEMBERS: 'Ban members',
	CREATE_INSTANT_INVITE: 'Create instant invite',
	CHANGE_NICKNAME: 'Change nickname',
	MANAGE_NICKNAMES: 'Manage nicknames',
	MANAGE_EMOJIS: 'Manage emojis',
	MANAGE_WEBHOOKS: 'Manage webhooks',
	VIEW_CHANNEL: 'View channels',
	SEND_MESSAGES: 'Send messages',
	SEND_TTS_MESSAGES: 'Send TTS messages',
	MANAGE_MESSAGES: 'Manage messages',
	EMBED_LINKS: 'Embed links',
	ATTACH_FILES: 'Attach files',
	READ_MESSAGE_HISTORY: 'Read message history',
	MENTION_EVERYONE: 'Mention everyone',
	USE_EXTERNAL_EMOJIS: 'Use external emojis',
	ADD_REACTIONS: 'Add reactions',
	CONNECT: 'Connect',
	SPEAK: 'Speak',
	MUTE_MEMBERS: 'Mute members',
	DEAFEN_MEMBERS: 'Deafen members',
	MOVE_MEMBERS: 'Move members',
	USE_VAD: 'Use voice activity',
	PRIORITY_SPEAKER: 'Priority speaker',
	VIEW_GUILD_INSIGHTS: 'View server insights',
	STREAM: 'Video'
};

module.exports = {
    async userperm(message, userPermissionsmsg, userPermissionsvc) {
        const missing = []
        let msgmissing = null
        let voicemissing = null
        if (userPermissionsmsg.length > 0) {
            msgmissing = message.channel.permissionsFor(message.author).missing(userPermissionsmsg);
            msgmissing.map(element =>
                missing.push(element)
            );
        }
        if (userPermissionsvc.length > 0) {
            voicemissing = message.member.voice.channel.permissionsFor(message.author).missing(userPermissionsvc);
            voicemissing.map(element =>
                missing.push(element)
            );
        }
        if(missing.length > 0) {
            if(missing.length === 1) {
                return `This command requires you to have the \`${permissions[missing[0]]}\` permission.`;
            }
            return oneLine`
                This command requires you to have the following permissions:
                \`${missing.map(perm => permissions[perm]).join(', ')}\`
            `;
        }
        return true;
    },

    async clientperm(message, clientPermissionsmsg, clientPermissionsvc) {
        const missing = []
        let msgmissing = null
        let voicemissing = null
        if (clientPermissionsmsg.length > 0) {
            msgmissing = message.channel.permissionsFor(message.guild.me).missing(clientPermissionsmsg);
            msgmissing.map(element =>
                missing.push(element)
            );
        } 
        if (clientPermissionsvc.length > 0) {
            voicemissing = message.guild.me.voice.channel.permissionsFor(message.guild.me).missing(clientPermissionsvc);
            voicemissing.map(element =>
                missing.push(element)
            );
        }
        if(missing.length > 0) {
            if(missing.length === 1) {
                return message.reply(
                    `I need the \`${permissions[missing[0]]}\` permission for this command to work.`
                );
            }
            return message.reply(oneLine`
                I need the following permissions for this command to work:
                \`${missing.map(perm => permissions[perm]).join(', ')}\`
            `);
        }
        return true;
    }
}