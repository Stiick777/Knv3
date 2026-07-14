export default {
  command: ['delete', 'del', 'd', 'borrar'],
  category: 'group',
  description: '',
  isAdmin: true,
  isBotAdmin: true,
  run: async ({ msg, sock, text }) => {
    try {
      if (msg.quoted) {
        const key = msg.quoted.key || {
          remoteJid: msg.chat,
          fromMe: msg.quoted.fromMe,
          id: msg.quoted.id,
          participant: msg.quoted.sender || msg.quoted.author
        };

        await sock.sendMessage(msg.chat, {
          delete: key
        });

        const count = parseInt(text);

        if (!isNaN(count) && count > 1) {
          const limit = Math.min(count - 1, 20);

          const messages =
            sock.store?.messages[msg.chat]?.array || [];

          const userMessages = messages
            .filter(
              v =>
                (v.key.participant || v.key.remoteJid) ===
                msg.quoted.sender
            )
            .slice(-limit);

          for (const message of userMessages.reverse()) {
            await sock.sendMessage(
              msg.chat,
              {
                delete: message.key
              }
            ).catch(() => null);
          }
        }

        return await msg.react('🗑️');
      }

      const count = parseInt(text);

      if (!isNaN(count) && count > 0) {
        const limit = Math.min(count, 20);

        const messages =
          sock.store?.messages[msg.chat]?.array || [];

        if (!messages || messages.length === 0) {
          return msg.reply(
            '> ⚠ El store está vacío para este chat.'
          );
        }

        const toDelete = messages.slice(-limit);

        for (const message of toDelete.reverse()) {
          if (message.key) {
            await sock.sendMessage(
              msg.chat,
              {
                delete: message.key
              }
            ).catch(() => null);
          }
        }

        return await msg.react('🗑️');
      }

      return msg.reply(
        '> ✎ Responde a un mensaje para borrarlo.'
      );

    } catch (e) {
      const errorText = format(e);

      await msg.reply(
        `❌ *ERROR CRÍTICO AL ELIMINAR*\n\n> *Mensaje:* ${e.message}\n\n\`\`\`${errorText}\`\`\``
      );
    }
  },
};
