var handler = async (m, { conn, usedPrefix, command, text }) => {

  // ✅ Función para normalizar cualquier JID
  function normalizeJid(jid = '') {
    return jid.replace(/@.+/, '@s.whatsapp.net')
  }

  let number = ''
  if (isNaN(text) && !text?.includes('@')) {
    // Si no es número y tampoco tiene @ (nada válido)
  } else if (isNaN(text)) {
    number = text.split('@')[1]
  } else if (!isNaN(text)) {
    number = text
  }

  if ((!text && !m.quoted) || (number.length > 13 || (number.length < 11 && number.length > 0))) {
    return conn.reply(m.chat, `🚫 Debes mencionar a un usuario válido para degradarlo.`, m)
  }

  try {
    let user = ''
    if (text) {
      user = normalizeJid(number)
    } else if (m.quoted?.sender) {
      user = normalizeJid(m.quoted.sender)
    } else if (m.mentionedJid?.[0]) {
      user = normalizeJid(m.mentionedJid[0])
    }

    await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
    conn.reply(m.chat, `✅ Usuario degradado correctamente.`, m)

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Ocurrió un error al degradar al usuario.`, m)
  }
}

handler.help = ['demote']
handler.tags = ['grupo']
handler.command = ['demote','quitarpija', 'degradar']
handler.group = true
handler.admin = true
handler.botAdmin = true
handler.fail = null

export default handler
