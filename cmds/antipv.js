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
  // DEBUG COMPLETO
  // ============================================
  console.log('\n========== ANT_PRIVATE DEBUG ==========');

  console.log('msg.sender:', msg.sender);

  console.log('msg.key:', msg.key);

  console.log('msg.participant:', msg.participant);

  console.log('msg.remoteJid:', msg.key?.remoteJid);

  console.log('msg.isGroup:', msg.isGroup);

  console.log('msg.fromMe:', msg.fromMe);

  console.log('msg.pushName:', msg.pushName);

  console.log('=======================================\n');

  // ============================================
  // OBTENER JID
  // ============================================
  const sender = msg.sender || msg.key?.participant || '';

  // ============================================
  // NEWSLETTER / CANALES
  // ============================================
  if (sender.endsWith('@newsletter')) {
    console.log('[AntiPrivate] Newsletter ignorado:', sender);
    return true;
  }

  // ============================================
  // BROADCAST
  // ============================================
  if (sender.endsWith('@broadcast')) {
    console.log('[AntiPrivate] Broadcast ignorado:', sender);
    return true;
  }

  // ============================================
  // TIPOS DE USUARIO
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
    // @LID
    // ============================================
    if (isLID) {
      console.log('[AntiPrivate] Detectado @lid:', sender);

      // Intentar resolver mediante onWhatsApp
      const result = await sock
        .onWhatsApp(sender)
        .catch(e => {
          console.log(
            '[AntiPrivate] onWhatsApp error:',
            e.message
          );

          return [];
        });

      console.log(
        '[AntiPrivate] Resultado onWhatsApp:',
        result
      );

      const user = result?.[0];

      if (user?.jid) {
        jid = user.jid;

        console.log(
          '[AntiPrivate] LID convertido:',
          sender,
          '=>',
          jid
        );
      } else {
        console.log(
          '[AntiPrivate] No se pudo resolver LID:',
          sender
        );

        // IMPORTANTE:
        // No intentamos bloquear directamente el @lid
        // porque updateBlockStatus no lo acepta.
        return true;
      }
    }

    // ============================================
    // VALIDAR JID FINAL
    // ============================================
    if (!jid || !jid.endsWith('@s.whatsapp.net')) {
      console.log(
        '[AntiPrivate] JID final no bloqueable:',
        jid
      );

      return true;
    }

    // ============================================
    // NOMBRE DEL USUARIO
    // ============================================
    const mention =
      msg.pushName ||
      jid.split('@')[0];

    // ============================================
    // AVISAR AL USUARIO
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

