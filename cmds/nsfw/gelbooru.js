export default {
  command: ['blush', 'sonrojarse'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock }) => {
    let who;

    if (msg.isGroup) {
      who = msg.mentionedJid[0]
        ? msg.mentionedJid[0]
        : msg.quoted
        ? msg.quoted.sender
        : false;
    } else {
      who = msg.chat;
    }

    if (!who) {
      return sock.sendMessage(msg.chat, {
        text: 'Etiqueta o menciona a alguien'
      });
    }

    let name = await sock.getName(who);
    let name2 = await sock.getName(msg.sender);

    await msg.react('🤭');

    let str;

    if (msg.mentionedJid.length > 0) {
      str = `${name2} se sonrojó por ${name || who}`;
    } else if (msg.quoted) {
      str = `${name2} se sonrojó por ${name || who}`;
    } else {
      str = `${name2} se sonrojó solo.`;
    }

    if (msg.isGroup) {
      let pp = 'https://qu.ax/GQLO.mp4';
      let pp2 = 'https://qu.ax/bzFY.mp4';
      let pp3 = 'https://qu.ax/OQFE.mp4';
      let pp4 = 'https://qu.ax/GQLO.mp4';
      let pp5 = 'https://qu.ax/GssX.mp4';
      let pp6 = 'https://qu.ax/NeQYU.mp4';
      let pp7 = 'https://qu.ax/ypqXb.mp4';
      let pp8 = 'https://qu.ax/rxME.mp4';
      let pp9 = 'https://qu.ax/mNLhE.mp4';
      let pp10 = 'https://qu.ax/WVjPF.mp4';

      const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8, pp9, pp10];
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
  },
};
