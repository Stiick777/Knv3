export default {
  command: ['testblock'],
  isOwner: true,

  run: async ({ msg, sock }) => {
    try {
      await sock.updateBlockStatus(msg.sender, 'block')
      await msg.reply('Bloqueado correctamente')
    } catch (e) {
      await msg.reply(e.stack || e.message)
    }
  }
}
