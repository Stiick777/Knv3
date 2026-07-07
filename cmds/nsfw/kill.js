import fs from 'fs';
import path from 'path';

export default {
  command: ['kill', 'matar'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock }) => {
    let who;

    // Verificamos si se menciona a alguien o se cita un mensaje
    if (msg.mentionedJid.length > 0) {
      who = msg.mentionedJid[0];
    } else if (msg.quoted) {
      who = msg.quoted.sender;
    } else {
      who = msg.sender;
    }

    let name = await sock.getName(who);
    let name2 = await sock.getName(msg.sender);

    await msg.react('🗡️');

    // Construimos el mensaje dependiendo de la acción
    let str = msg.sender === who
      ? `\`${name2}\` se mató a sí mismo ( ⚆ _ ⚆ ).`
      : `\`${name2}\` mató a \`${name}\` ( ⚆ _ ⚆ ).`;

    let videos = [
      'https://qu.ax/GQLO.mp4',
      'https://qu.ax/bzFY.mp4',
      'https://qu.ax/OQFE.mp4',
      'https://qu.ax/GssX.mp4',
      'https://qu.ax/NeQYU.mp4',
      'https://qu.ax/ypqXb.mp4',
      'https://qu.ax/rxME.mp4',
      'https://qu.ax/mNLhE.mp4',
      'https://qu.ax/WVjPF.mp4'
    ];

    const video = videos[Math.floor(Math.random() * videos.length)];

    try {
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
    } catch (e) {
      await msg.reply(
        '⚠️ *¡Ocurrió un error al enviar el video!*'
      );
    }
  },
};
