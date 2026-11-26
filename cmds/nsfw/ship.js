
export default {
  command: ['ship', 'love'],
  category: 'fun',
  description: 'Calcula el porcentaje de amor entre dos personas.',

  run: async ({ msg, sock, text }) => {
    if (!text) {
      return msg.reply('🔰 *Escribe el nombre de dos personas para calcular su amor*');
    }

    const [text1, ...rest] = text.trim().split(/\s+/);
    const text2 = rest.join(' ');

    if (!text2) {
      return msg.reply('🍁 *Escribe el nombre de la segunda persona*');
    }

    const love = `❤️ *${text1}* tu oportunidad de enamorarte de *${text2}* es de ${Math.floor(Math.random() * 101)}% 👩🏻‍❤️‍👨🏻`;

    await sock.sendMessage(
      msg.chat,
      {
        text: love
      },
      {
        quoted: msg
      }
    );
  },
};
