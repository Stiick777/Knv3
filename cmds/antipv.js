export async function before({ msg, sock, isOwner, isROwner }) {
  if (msg.isBaileys && msg.fromMe) return true;
  if (msg.fromMe) return false;

  // Los grupos no son privados
  if (msg.isGroup) return false;

  if (!msg.message) return true;

  if (isOwner || isROwner) return false;

  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  if (msg.sender === botJid) return false;

  const settings = global.db.getSettings(botJid);

  if (!settings.antiPrivate) return false;

  const sender = msg.sender || msg.chat || '';

  // ============================================
  // IGNORAR CANALES / NEWSLETTERS
  // ============================================
  if (sender.endsWith('@newsletter')) {
    return true;
  }

  // Broadcast
  if (sender.endsWith('@broadcast')) {
    return true;
  }

  // ============================================
  // USUARIOS NORMALES Y @LID
  // ============================================
  const isPN = sender.endsWith('@s.whatsapp.net');
  const isLID = sender.endsWith('@lid');

  if (!isPN && !isLID) {
    console.log('[AntiPrivate] JID ignorado:', sender);
    return true;
  }

  try {
    let jid = sender;

    // ============================================
    // RESOLVER @LID A @s.whatsapp.net
    // ============================================
    if (isLID) {
      const [user] = await sock.onWhatsApp(sender).catch(() => []);

      if (user?.jid) {
        jid = user.jid;
      } else {
        console.log('[AntiPrivate] No se pudo resolver LID:', sender);
        return true;
      }
    }

    // ============================================
    // ASEGURARNOS DE TENER UN JID BLOQUEABLE
    // ============================================
    if (!jid.endsWith('@s.whatsapp.net')) {
      console.log('[AntiPrivate] JID no bloqueable:', jid);
      return true;
    }

    const mention =
      msg.pushName ||
      jid.split('@')[0];

    await msg.reply(
      `[ ✰ ] Hola *${mention}*, no está permitido escribir al privado del bot, por lo que serás bloqueado.\n\n> Si quieres usar el bot puedes hacerlo en el grupo oficial.\nhttps://chat.whatsapp.com/FhJrUdTpY8AL9jXcmb4ohT`
    );

    await sock.updateBlockStatus(jid, 'block');

    console.log('[AntiPrivate] Usuario bloqueado:', jid);

  } catch (e) {
    console.error('[AntiPrivate] Error:', e);
  }

  return false;
}
