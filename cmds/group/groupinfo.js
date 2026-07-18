import ws from 'ws';
import db from '#db';

export default {
  command: ['gp', 'groupinfo'],
  category: 'group',
  description: 'Ver la información del grupo.',
  run: async ({ msg, sock, usedPrefix, command, groupMetadata, participants }) => {
    const groupName = groupMetadata?.subject;
    const groupBanner = await sock.profilePictureUrl(msg.chat, 'image').catch(() => 'https://cdn.yuki-wabot.my.id/files/2PVh.jpeg');
    const groupCreator = groupMetadata?.owner ? '@' + groupMetadata.owner.split('@')[0] : 'Desconocido';
    const groupAdmins = participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin')) || [];
    const totalParticipants = participants.length;

    const chat = db.getChat(msg.chat) || {};
    const allChatUsers = db.getChatUser(msg.chat);

    const usersMap = {};
    for (const user of allChatUsers) {
      usersMap[user.user_id] = user;
    }

    const botId = sock.user.id.split(':')[0] + "@s.whatsapp.net";
    const botSettings = db.getSettings(botId) || {};
    const botname = botSettings.botname;

    let registeredUsersInGroup = 0;

    for (const participant of participants) {
      const user = usersMap[participant.id];
      if (user) registeredUsersInGroup++;
    }

    const rawPrimary = typeof chat.primaryBot === 'string' ? chat.primaryBot : '';
    const botprimary = rawPrimary.endsWith('@s.whatsapp.net')
      ? `@${rawPrimary.split('@')[0]}`
      : 'Aleatorio';

    const settings = {
      bot: chat.isBanned ? '✘ Desactivado' : '✓ Activado',
      antilinks: chat.antilinks ? '✓ Activado' : '✘ Desactivado',
      antistatus: chat.antistatus ? '✓ Activado' : '✘ Desactivado',
      welcome: chat.welcome ? '✓ Activado' : '✘ Desactivado',
      goodbye: chat.goodbye ? '✓ Activado' : '✘ Desactivado',
      alerts: chat.alerts ? '✓ Activado' : '✘ Desactivado',
      adminmode: chat.adminonly ? '✓ Activado' : '✘ Desactivado',
      botprimary
    };

    try {
      let message = `*「✿」Grupo ◢ ${groupName} ◤*\n\n`;
      message += `➪ *Creador ›* ${groupCreator}\n`;
      message += `❖ Bot Principal › *${settings.botprimary}*\n`;
      message += `♤ Admins › *${groupAdmins.length}*\n`;
      message += `❒ Usuarios › *${totalParticipants}*\n`;
      message += `ꕥ Registrados › *${registeredUsersInGroup}*\n\n`;

      message += `➪ *Configuraciones:*\n`;
      message += `✐ ${botname} › *${settings.bot}*\n`;
      message += `✐ AntiLinks › *${settings.antilinks}*\n`;
      message += `✐ AntiStatus › *${settings.antistatus}*\n`;
      message += `✐ Bienvenida › *${settings.welcome}*\n`;
      message += `✐ Despedida › *${settings.goodbye}*\n`;
      message += `✐ Alertas › *${settings.alerts}*\n`;
      message += `✐ ModoAdmin › *${settings.adminmode}*`;

      const mentionOw = groupMetadata?.owner ? groupMetadata.owner : '';
      const mentions = [rawPrimary, mentionOw].filter(Boolean);

      await sock.sendMessage(msg.chat, {
        text: message.trim(),
        mentions
      });
    } catch (e) {
      await msg.reply(
        `> An unexpected error occurred while executing command *${usedPrefix + command}*. Please try again or contact support if the issue persists.\n> [Error: *${e.message}*]`
      );
    }
  }
};
