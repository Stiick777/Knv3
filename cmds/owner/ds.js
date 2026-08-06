import fs from 'fs/promises'
import path from 'path'
import db from '#db'
import { setCachedMeta } from '#serialize'

export default {
  command: ['fixmsgespera', 'ds'],
  category: 'utils',
  description: 'Regenera las sender keys del grupo.',

  run: async ({ msg, sock }) => {
    if (!msg.isGroup) {
      return sock.reply(
        msg.chat,
        '❌ Este comando solo funciona en grupos.',
        msg
      )
    }

    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const settings = db.getSettings(botJid)

    if (settings.type === 'Sub') {
      return sock.reply(
        msg.chat,
        '💡 Utiliza este comando únicamente desde el Bot principal.',
        msg
      )
    }

    const sessionPath = './Sessions/Owner'

    try {
      const files = await fs.readdir(sessionPath)

      const senderKeys = files.filter(file =>
        file.startsWith(`sender-key-${msg.chat}`)
      )

      let deleted = 0

      for (const file of senderKeys) {
        try {
          await fs.unlink(path.join(sessionPath, file))
          deleted++
        } catch {}
      }

      try {
        await fs.unlink(
          path.join(sessionPath, `sender-key-memory-${msg.chat}.json`)
        )
      } catch {}

      try {
        setCachedMeta(msg.chat, null)
      } catch {}

      await sock.groupMetadata(msg.chat)

      await sock.reply(
        msg.chat,
        `✅ Reparación completada.

🗑 Sender Keys eliminadas: ${deleted}

🔄 Metadata sincronizada correctamente.

⚠️ Envía nuevamente el comando que mostraba "Esperando mensaje".`,
        msg
      )

    } catch (e) {
      console.error(e)

      await sock.reply(
        msg.chat,
        `❌ Error:\n${e.message}`,
        msg
      )
    }
  }
}
