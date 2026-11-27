
import db from '#db';

export default {
  command: ['coffe', 'cafe'],
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

    await msg.react('☕');

    let str;

    if (msg.mentionedJid?.length > 0) {
      str = `\`${name2}\` *tomá una tácita de café con* \`${name || who}\`.`;
    } else if (msg.quoted) {
      str = `\`${name2}\` *esta tomándo una tácita de café con* \`${name || who}\`.`;
    } else {
      str = `\`${name2}\` *se toma una tácita de café.*`.trim();
    }

    if (msg.isGroup) {
      const videos = [
        'https://files.catbox.moe/k6bzj0.mp4',
        'https://files.catbox.moe/3pj3nx.mp4',
        'https://files.catbox.moe/wcpe4z.mp4',
        'https://files.catbox.moe/64t3cf.mp4',
        'https://files.catbox.moe/qy1qmo.mp4',
        'https://files.catbox.moe/va1mu7.mp4',
        'https://files.catbox.moe/zqqre3.mp4',
        'https://files.catbox.moe/duydzw.mp4',
        'https://files.catbox.moe/4mn95m.mp4'
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
