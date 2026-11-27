
import db from '#db';

export default {
  command: ['hello', 'hola', 'saludo'],
  category: 'anime',
  description: '',

  run: async ({ msg, sock }) => {
    let who;

    if (msg.mentionedJid?.length > 0) {
      who = msg.mentionedJid[0];
    } else if (msg.quoted) {
      who = msg.quoted.sender;
    } else {
      who = msg.sender;
    }

    const name = db.getUser(who)?.name || who.split('@')[0];
    const name2 = db.getUser(msg.sender)?.name || msg.pushName || msg.sender.split('@')[0];

    await msg.react('👋');

    let str;

    if (msg.mentionedJid?.length > 0) {
      str = `\`${name2}\` *hola* \`${name || who}\` *como estas?.*`;
    } else if (msg.quoted) {
      str = `\`${name2}\` *hola* \`${name || who}\` *como te encuentras hoy?.*`;
    } else {
      str = `\`${name2}\` *saluda a todos los integrantes del grupo, como se encuentran?*`.trim();
    }

    if (msg.isGroup) {
      const videos = [
        'https://qu.ax/EcRBE.mp4',
        'https://qu.ax/oARle.mp4',
        'https://qu.ax/eQXQh.mp4',
        'https://qu.ax/ddLrC.mp4',
        'https://qu.ax/oalOG.mp4',
        'https://qu.ax/nYJ.mp4',
        'https://qu.ax/bkcz.mp4',
        'https://qu.ax/oARle.mp4'
      ];

      const video = videos[Math.floor(Math.random() * videos.length)];

      await sock.sendMessage(
        msg.chat,
        {
          video: { url: video },
          gifPlayback: true,
          caption: str,
          mentions: [who]
        },
        {
          quoted: msg
        }
      );
    }
  }
};
