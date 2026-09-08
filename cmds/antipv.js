export async function before({ msg, sock, isOwner, isROwner }) {
  // Mensajes propios/Baileys
  if (msg.isBaileys && msg.fromMe) return true;
  if (msg.fromMe) return false;

  // Grupos no son privados
  if (msg.isGroup) return false;

  // Sin mensaje
  if (!msg.message) return true;

  // Owner no se bloquea
  if (isOwner || isROwner) return false;

  // JID del bot
  const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

  // El propio bot
  if (msg.sender === botJid) return false;

  // =====================================================
  // IGNORAR NEWSLETTERS / CANALES
  // =====================================================
  const sender = msg.sender || msg.chat || '';

  if (
    sender.endsWith('@newsletter') ||
    sender.endsWith('@broadcast')
  ) {
    return true;
  }

  // Solo permitir JID de usuario real
  if (!sender.endsWith('@s.whatsapp.net')) {
    console.log('[AntiPrivate] JID ignorado:', sender);
    return true;
  }

  // Configuración
  const settings = global.db.getSettings(botJid);

  if (!settings.antiPrivate) return false;

  try {
    // Verificar JID mediante onWhatsApp
    const [user] = await sock.onWhatsApp(sender).catch(() => []);

    const jid = user?.jid || sender;

    // Volver a comprobar antes de bloquear
    if (!jid || !jid.endsWith('@s.whatsapp.net')) {
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
