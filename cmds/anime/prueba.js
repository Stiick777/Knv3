import db from '#db';

export default {
  command: ['testbotname'],
  category: 'owner',
  run: async ({ msg, sock }) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = db.getSettings(botId) || {};

    await msg.reply(
`🆔 ID: ${botId}

🤖 botname: ${settings.botname}
🏷️ namebot: ${settings.namebot}

📦 Configuración:
${JSON.stringify(settings, null, 2)}`
    );
  }
};
