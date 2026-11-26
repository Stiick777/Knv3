
import db from '#db';

export default {
  command: ['morder'],
  category: 'fun',
  description: '',

  run: async ({ msg, sock }) => {
    let who;

    if (msg.isGroup) {
      who = msg.mentionedJid?.[0]
        ? msg.mentionedJid[0]
        : msg.quoted
        ? msg.quoted.sender
        : false;
    } else {
      who = msg.chat;
    }

    if (!who) throw 'Etiqueta o menciona a alguien';

    const name = db.getUser(who)?.name || who.split('@')[0];
    const name2 = db.getUser(msg.sender)?.name || msg.pushName || msg.sender.split('@')[0];

    await msg.react('😾');

    let str;

    if (msg.mentionedJid?.length > 0) {
      str = `${name2} mordió a ${name || who}.`;
    } else if (msg.quoted) {
      str = `${name2} mordió a ${name || who}.`;
    } else {
      str = `${name2} se mordió a sí mismo ( ⚆ _ ⚆ ).`;
    }

    if (msg.isGroup) {
      const videos = [
        'https://files.catbox.moe/zsovfx.mp4',
        'https://files.catbox.moe/g0jfq7.mp4',
        'https://files.catbox.moe/m94q5i.mp4',

        'https://files.catbox.moe/9i63rq.mp4',
        'https://files.catbox.moe/bw9qqd.mp4',
        'https://files.catbox.moe/a8e6j2.mp4'
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
  },
};
