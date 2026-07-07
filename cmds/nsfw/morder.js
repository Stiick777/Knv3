
export default {
  command: ['morder'],
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

    if (!who) throw 'Etiqueta o menciona a alguien';

    let name = sock.getName(who);
    let name2 = sock.getName(msg.sender);

    await msg.react('😾');

    let str;

    if (msg.mentionedJid.length > 0) {
      str = `${name2} mordió a ${name || who}.`;
    } else if (msg.quoted) {
      str = `${name2} mordió a ${name || who}.`;
    } else {
      str = `${name2} se mordió a sí mismo ( ⚆ _ ⚆ ).`;
    }

    if (msg.isGroup) {
      let pp = 'https://files.catbox.moe/zsovfx.mp4';
      let pp2 = 'https://files.catbox.moe/g0jfq7.mp4';
      let pp3 = 'https://files.catbox.moe/m94q5i.mp4';
      let pp4 = 'https://files.catbox.moe/77vbwy.mp4';
      let pp5 = 'https://files.catbox.moe/9i63rq.mp4';
      let pp6 = 'https://files.catbox.moe/bw9qqd.mp4';
      let pp7 = 'https://files.catbox.moe/a8e6j2.mp4';

      const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7];
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
