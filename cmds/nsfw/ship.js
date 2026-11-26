
export default {
  command: ['ship', 'love'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock, text }) => {

    if (!text) {
      return msg.reply('🔰 *Escribe el nombre de dos personas para calcular su amor*');
    }

    let [text1, ...text2] = text.split(' ');
    text2 = text2.join(' ');

    if (!text2) {
      return msg.reply('🍁 *Escribe el nombre de la segunda persona*');
    }

    const love = `❤️ *${text1}* tu oportunidad de enamorarte de *${text2}* es de ${Math.floor(Math.random() * 100)}% 👩🏻‍❤️‍👨🏻`;

    const mentions = [...love.matchAll(/@(\d{5,16})/g)].map(v => v[1] + '@s.whatsapp.net');

    await sock.sendMessage(
      msg.chat,
      {
        text: love,
        mentions
      },
      {
        quoted: msg
      }
    );
  },
};
