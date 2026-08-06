import { promises as fs } from 'fs'
import db from '#db'
import path from 'path'
export default {
  command: ['fixmsgespera', 'ds'],
  category: 'fix',
  description: 'Muestra las sesiones.',

  run: async ({ msg, sock }) => {
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = db.getSettings(botJid)

    if (settings.type === 'Sub') {
      return sock.reply(
        msg.chat,
        '💡 *Utiliza este comando directamente en el número principal del Bot*',
        msg
      )
    }

    try {
      const subsPath = './Sessions/Subs'
const folders = await fs.readdir(subsPath)

let text = '📂 *Contenido de las carpetas:*\n\n'

for (const folder of folders) {
  const items = await fs.readdir(path.join(subsPath, folder))

  text += `📁 ${folder}\n`
  text += items.length ? items.join('\n') : '(vacía)'
  text += '\n\n'
}

return sock.reply(msg.chat, text, msg)
    } catch (err) {
      console.error(err)
      return sock.reply(
        msg.chat,
        `❌ Error:\n${err}`,
        msg
      )
    }
  }
}
