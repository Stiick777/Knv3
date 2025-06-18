
let handler = async (m, { conn }) => {
  // Obtener el ID del usuario target:
  let userLid = m.sender // valor por defecto

  if (m.quoted) {
    userLid = m.quoted.sender // si se responde a alguien
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    userLid = m.mentionedJid[0] // si se etiqueta a alguien
  }

  await conn.sendMessage(m.chat, { text: `El LID es: ${userLid}` }, { quoted: m })
}

handler.help = ['mylid', 'lid']
handler.tags = ['info']
handler.command = ['mylid', 'lid']

export default handler
