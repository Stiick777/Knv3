export default {
  command: ['testbotname'],
  category: 'owner',
  run: async ({ msg, sock, db }) => {
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
    const settings = db.getSettings(botId) || {};

    await msg.reply(
`📋 Configuración del bot

🆔 ID: ${botId}

🤖 botname: ${settings.botname}
🏷️ namebot: ${settings.namebot}

📦 Datos completos:
${JSON.stringify(settings, null, 2)}`
    );
  }
};
