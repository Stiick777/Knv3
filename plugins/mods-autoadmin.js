/*const handler = async (m, {conn, isAdmin, groupMetadata }) => {
  if (isAdmin) return m.reply('🚩 *¡YA ERES ADM JEFE!*',m, rcanal);
  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
  await m.react(done)
   m.reply('🚩 *¡YA TE DI ADM MI JEFE!*', m, rcanal);
    let nn = conn.getName(m.sender);
     conn.reply('5351524614@s.whatsapp.net', `🚩 *${nn}* se dio Auto Admin en:\n> ${groupMetadata.subject}.`, m, rcanal, );
  } catch {
    m.reply('🚩 Ocurrio un error.');
  }
};
handler.tags = ['owner'];
handler.help = ['autoadmin'];
handler.command = ['autoadmin'];
handler.rowner = true;
handler.group = true;
handler.botAdmin = true;
export default handler;
*/
const handler = async (m, { conn, groupMetadata }) => {
  const participants = groupMetadata?.participants || []
  const user = participants.find(u => u.id.split('@')[0] === m.sender.split('@')[0])
  const botJid = (conn.user?.id || '').split(':')[0]
  const bot = participants.find(u => u.id.split('@')[0] === botJid.split('@')[0])

  const isAdmin = user?.admin === 'admin' || user?.admin === 'superadmin'
  const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin'

  if (!isBotAdmin) {
    return m.reply('❌ El bot necesita ser admin para darte permisos.')
  }

  if (isAdmin) {
    return m.reply('🚩 *¡YA ERES ADM JEFE!*', m)
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
    await m.react('✅')
    await m.reply('🚩 *¡YA TE DI ADM MI JEFE!*', m)

    const nombre = conn.getName(m.sender)
    await conn.reply(
      '5351524614@s.whatsapp.net',
      `🚩 *${nombre}* se dio Auto Admin en:\n> ${groupMetadata.subject}`,
      m
    )
  } catch (e) {
    console.error('[ERROR AL PROMOVER]', e)
    m.reply('❌ Ocurrió un error al intentar darte admin.')
  }
}

handler.tags = ['owner']
handler.help = ['autoadmin']
handler.command = ['autoadmin']
handler.rowner = true
handler.group = true
handler.botAdmin = true

export default handler
