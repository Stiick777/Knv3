export async function before({ msg, sock, isOwner, isROwner }) {
  if (msg.isBaileys && msg.fromMe) return true;
  if (msg.isGroup) return false;
  if (!msg.message) return true;
  if (isOwner || isROwner) return false;

  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

if (msg.sender === botJid) return false;
if (msg.fromMe) return false;
  const settings = global.db.getSettings(botJid);

  if (!settings.antiPrivate) return false;

  const [user] = await sock.onWhatsApp(msg.sender).catch(() => []);
  const jid = msg.sender;

  try {
    const mention =
  msg.pushName ||
  jid.split('@')[0];

await msg.reply(
  `*[ ✰ ] Hola *${mention}*, no está permitido escribir al privado del bot, por lo que serás bloqueado.*`
);

await sock.updateBlockStatus(jid, 'block');
  } catch (e) {
    console.error('[AntiPrivate]', e);
  }

  return false;
}
