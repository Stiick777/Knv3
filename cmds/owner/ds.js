import { promises as fs } from 'fs'
import path from 'path'

export default {
  command: ['fixmsgespera', 'ds'],
  category: 'fix',
  description: 'Elimina archivos de sesión del chat actual.',

  run: async ({ msg, sock }) => {
    if (global.conn.user.jid !== sock.user.jid) {
      return sock.reply(
        msg.chat,
        '💡 *Utiliza este comando directamente en el número principal del Bot*',
        msg
      )
    }

    const chatId = msg.isGroup ? [msg.chat, msg.sender] : [msg.sender]
    const sessionPath = './Sessions/'

    try {
      const files = await fs.readdir(sessionPath)
      let filesDeleted = 0

      for (const file of files) {
        for (const id of chatId) {
          if (file.includes(id.split('@')[0])) {
            await fs.unlink(path.join(sessionPath, file))
            filesDeleted++
            break
          }
        }
      }

      if (filesDeleted === 0) {
        return sock.reply(
          msg.chat,
          '❌ *No se encontró ningún archivo que incluya la ID del chat*',
          msg
        )
      }

      await sock.reply(
        msg.chat,
        `🔰 *Se eliminaron ${filesDeleted} archivos de sesión*`,
        msg
      )

      await sock.reply(
        msg.chat,
        '⚡ *¡Hola! ¿Logras verme?*',
        msg
      )

    } catch (err) {
      console.error('Error al leer la carpeta o los archivos de sesión:', err)
      await sock.reply(
        msg.chat,
        '❌ *Ocurrió un fallo*',
        msg
      )
    }
  }
}
