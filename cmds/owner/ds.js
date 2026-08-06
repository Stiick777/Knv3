import { promises as fs } from 'fs'
import db from '#db'

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

      let text = '📂 *Sesiones encontradas:*\n\n'

      for (const folder of folders) {
        const creds = JSON.parse(
          await fs.readFile(`${subsPath}/${folder}/creds.json`, 'utf8')
        )

        text += `📁 Carpeta: ${folder}\n`
        text += `🆔 ID: ${creds.me?.id || 'No encontrado'}\n\n`
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
