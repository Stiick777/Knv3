let handler = async (m, { conn, usedPrefix, isOwner }) => {
let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;Stiiven;;\nFN:Stiiven\nORG:Stiiven\nTITLE:\nitem1.TEL;waid=5216645011701:5216645011701\nitem1.X-ABLabel:Stiiven⁩\nX-WA-BIZ-DESCRIPTION:\nX-WA-BIZ-NAME:Stiiven\nEND:VCARD`
await conn.sendMessage(m.chat, { contacts: { displayName: 'Stiiven⁩', contacts: [{ vcard }] }}, {quoted: m})
}
handler.help = ['owner']
handler.tags = ['main']
handler.command = ['owner', 'creator', 'creador', 'dueño'] 

export default handler