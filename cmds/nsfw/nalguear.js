
import db from '#db';

export default {
  command: ['nalguear'],
  category: 'fun',
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

    await msg.react('🔥');

    let str;

    if (msg.mentionedJid?.length > 0) {
      str = `\`${name2}\` nalgueó a \`${name || who}\``;
    } else if (msg.quoted) {
      str = `\`${name2}\` nalgueó a \`${name || who}\``;
    } else {
      str = `\`${name2}\` se nalgueó a sí mismo ( ⚆ _ ⚆ ).`;
    }

    if (msg.isGroup) {
      const videos = [
        'https://telegra.ph/file/d4b85856b2685b5013a8a.mp4',
        'https://telegra.ph/file/e278ca6dc7d26a2cfda46.mp4',
        'https://telegra.ph/file/f830f235f844e30d22e8e.mp4',
        'https://telegra.ph/file/07fe0023525be2b2579f9.mp4',
        'https://telegra.ph/file/99e036ac43a09e044a223.mp4'
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
