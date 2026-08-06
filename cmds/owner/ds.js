import { promises as fs } from 'fs'
import path from 'path'
import db from '#db'

export default {
  command: ['fixmsgespera', 'ds'],
  category: 'fix',
  description: 'Elimina los archivos de sesión del chat actual.',

  run: async ({ msg, sock }) => {
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = db.getSettings(botJid)

    // Solo permitir en el bot principal
    if (settings.type === 'Sub') {
      return sock.reply(
        msg.chat,
        '💡 *Utiliza este comando directamente en el número principal del Bot*',
        msg
      )
    }

    const ids = msg.isGroup
      ? [msg.chat, msg.sender]
      : [msg.sender]

    const sessionPath = './Sessions/'

    try {
      const subsPath = './Sessions/Subs'

const folders = await fs.readdir(subsPath)

return sock.reply(
  msg.chat,
  `📂 *Contenido de Sessions/Subs:*\n\n${folders.length ? folders.join('\n') : '(vacío)'}`,
  msg
)


      let filesDeleted = 0

      for (const file of files) {
        for (const id of ids) {
          if (file.includes(id.split('@')[0])) {
            await fs.unlink(path.join(sessionPath, file))
            filesDeleted++
            break
          }
        }
      }

      if (!filesDeleted) {
        return sock.reply(
          msg.chat,
          '❌ *No se encontró ningún archivo que incluya la ID del chat.*',
          msg
        )
      }

      await sock.reply(
        msg.chat,
        `🔰 *Se eliminaron ${filesDeleted} archivo(s) de sesión.*`,
        msg
      )

      await sock.reply(
        msg.chat,
        '⚡ *¡Hola! ¿Logras verme?*',
        msg
      )

    } catch (err) {
      console.error(err)

      await sock.reply(
        msg.chat,
        '❌ *Ocurrió un fallo al leer o eliminar los archivos de sesión.*',
        msg
      )
    }
  }
}
