export async function before({ msg, sock, isOwner, isROwner }) {
  // ============================================
  // MENSAJES DEL PROPIO BOT
  // ============================================
  if (msg.isBaileys && msg.fromMe) return true;
  if (msg.fromMe) return false;

  // ============================================
  // GRUPOS
  // ============================================
  if (msg.isGroup) return false;

  // ============================================
  // SIN MENSAJE
  // ============================================
  if (!msg.message) return true;

  // ============================================
  // OWNER
  // ============================================
  if (isOwner || isROwner) return false;

  // ============================================
  // JID DEL BOT
  // ============================================
  const botJid =
    sock.user.id.split(':')[0] + '@s.whatsapp.net';

  if (msg.sender === botJid) return false;

  // ============================================
  // CONFIGURACIÓN
  // ============================================
  const settings = global.db.getSettings(botJid);

  if (!settings.antiPrivate) return false;

  // ============================================
  // DEBUG
  // ============================================
  console.log('\n========== ANT_PRIVATE DEBUG ==========');

  console.log('msg.sender:', msg.sender);

  console.log('msg.key:', msg.key);

  console.log('msg.participant:', msg.participant);

  console.log('msg.remoteJid:', msg.key?.remoteJid);

  console.log('msg.remoteJidAlt:', msg.key?.remoteJidAlt);

  console.log('msg.isGroup:', msg.isGroup);

  console.log('msg.fromMe:', msg.fromMe);

  console.log('msg.pushName:', msg.pushName);

  console.log('=======================================\n');

  // ============================================
  // OBTENER JID
  // ============================================
  const sender =
    msg.sender ||
    msg.key?.remoteJid ||
    '';

  // ============================================
  // NEWSLETTER / CANALES
  // ============================================
  if (sender.endsWith('@newsletter')) {
    console.log(
      '[AntiPrivate] Newsletter ignorado:',
      sender
    );

    return true;
  }

  // ============================================
  // BROADCAST
  // ============================================
  if (sender.endsWith('@broadcast')) {
    console.log(
      '[AntiPrivate] Broadcast ignorado:',
      sender
    );

    return true;
  }

  // ============================================
  // JID FINAL PARA BLOQUEAR
  // ============================================
  let jid = sender;

  // ============================================
  // @LID
  // ============================================
  if (sender.endsWith('@lid')) {
    console.log(
      '[AntiPrivate] Detectado @lid:',
      sender
    );

    // Baileys ya proporciona el JID real
    // mediante remoteJidAlt
    const altJid = msg.key?.remoteJidAlt;

    console.log(
      '[AntiPrivate] remoteJidAlt:',
      altJid
    );

    if (
      altJid &&
      altJid.endsWith('@s.whatsapp.net')
    ) {
      jid = altJid;

      console.log(
        '[AntiPrivate] LID convertido:',
        sender,
        '=>',
        jid
      );
    } else {
      console.log(
        '[AntiPrivate] No existe remoteJidAlt válido para:',
        sender
      );

      return true;
    }
  }

  // ============================================
  // USUARIO NORMAL
  // ============================================
  if (!jid.endsWith('@s.whatsapp.net')) {
    console.log(
      '[AntiPrivate] JID no bloqueable:',
      jid
    );

    return true;
  }

  try {
    // ============================================
    // NOMBRE
    // ============================================
    const mention =
      msg.pushName ||
      jid.split('@')[0];

    // ============================================
    // AVISO
    // ============================================
    await msg.reply(
      `[ ✰ ] Hola *${mention}*, no está permitido escribir al privado del bot, por lo que serás bloqueado.\n\n> Si quieres usar el bot puedes hacerlo en el grupo oficial.\nhttps://chat.whatsapp.com/FhJrUdTpY8AL9jXcmb4ohT`
    );

    // ============================================
    // BLOQUEAR
    // ============================================
    await sock.updateBlockStatus(
      jid,
      'block'
    );

    console.log(
      '[AntiPrivate] Usuario bloqueado:',
      jid
    );

  } catch (e) {
    console.error(
      '[AntiPrivate] Error:',
      e.message
    );
  }

  return false;

}
