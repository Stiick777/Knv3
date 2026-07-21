import db from '#db';

const linkRegex =
  /(?:https?:\/\/)?(?:www\.)?(?:chat\.whatsapp\.com\/[A-Za-z0-9]+|whatsapp\.com\/channel\/[A-Za-z0-9]+)/i;

export async function before({
  msg,
  sock,
  groupMetadata,
  participants,
  isAdmins,
  isBotAdmins
}) {
  if (!msg.isGroup) return;
  if (!msg.text) return;
  if (msg.isBot) return;
  if (!groupMetadata) return;

  const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  const chat = db.getChat(msg.chat) || {};
  const settings = db.getSettings(botId) || {};

  const isSelf = (settings.self ?? false) || (chat.isMute ?? false);
  if (isSelf) return;

  const primaryBotId = chat.primaryBot;
  const isPrimary = !primaryBotId || primaryBotId === botId;

  const isGroupLink = linkRegex.test(msg.text);
  const hasAllowedLink =
    global.links?.channel &&
    msg.text.includes(global.links.channel);

  const command = (msg.command || '').toLowerCase();

  // Descomenta estas líneas para depurar si sigue sin funcionar
  /*
  console.log({
    text: msg.text,
    isGroupLink,
    antilinks: chat.antilinks,
    isAdmins,
    isBotAdmins,
    isPrimary
  });
  */

  if (
    hasAllowedLink ||
    !isGroupLink ||
    !chat.antilinks ||
    isAdmins ||
    !isBotAdmins ||
    !isPrimary
  ) {
    return;
  }

  if (command === 'invite') return;

  const isChannelLink = /whatsapp\.com\/channel\//i.test(msg.text);

  const user = db.getUser(msg.sender);
  const userName = user?.name || 'Usuario';

  try {
    // 1. Expulsar usuario
    await sock.groupParticipantsUpdate(
      msg.chat,
      [msg.sender],
      'remove'
    );

    // 2. Avisar
    await sock.reply(
      msg.chat,
      `> ꕥ Se ha eliminado a *${userName}* del grupo por \`Anti-Link\`, no permitimos enlaces de *${isChannelLink ? 'canales' : 'otros grupos'}*.`,
      null
    );

    // 3. Eliminar mensaje
    await sock.sendMessage(msg.chat, {
      delete: {
        remoteJid: msg.chat,
        fromMe: false,
        id: msg.key.id,
        participant: msg.key.participant
      }
    });
  } catch (e) {
    console.error('Error en Anti-Link:', e);
  }
}
