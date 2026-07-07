
export default {
  command: ['nalguear'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock }) => {
    let who;

    if (msg.mentionedJid.length > 0) {
      who = msg.mentionedJid[0];
    } else if (msg.quoted) {
      who = msg.quoted.sender;
    } else {
      who = msg.sender;
    }

    let name = sock.getName(who);
    let name2 = sock.getName(msg.sender);

    await msg.react('🔥');

    let str;

    if (msg.mentionedJid.length > 0) {
      str = `\`${name2}\` nalgueó a \`${name || who}\``;
    } else if (msg.quoted) {
      str = `\`${name2}\` nalgueó a \`${name || who}\``;
    } else {
      str = `\`${name2}\` se nalgueó a sí mismo ( ⚆ _ ⚆ ).`;
    }

    if (msg.isGroup) {
      let pp = 'https://telegra.ph/file/d4b85856b2685b5013a8a.mp4';
      let pp2 = 'https://telegra.ph/file/e278ca6dc7d26a2cfda46.mp4';
      let pp3 = 'https://telegra.ph/file/f830f235f844e30d22e8e.mp4';
      let pp4 = 'https://telegra.ph/file/07fe0023525be2b2579f9.mp4';
      let pp5 = 'https://telegra.ph/file/99e036ac43a09e044a223.mp4';

      const videos = [pp, pp2, pp3, pp4, pp5];
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
