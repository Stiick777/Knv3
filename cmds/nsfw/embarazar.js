
import db from '#db';

export default {
  command: ['preg', 'embarazar', 'preñar'],
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

    await msg.react('😏');

    let str;

    if (msg.mentionedJid?.length > 0) {
      str = `\`${name2}\` embarazó a \`${name || who}\` (⊙_⊙;).`;
    } else if (msg.quoted) {
      str = `\`${name2}\` embarazó a \`${name || who}\`.`;
    } else {
      str = `\`${name2}\` se embarazó a sí mismo (⊙_⊙;).`.trim();
    }

    if (msg.isGroup) {
      const videos = [
        'https://files.catbox.moe/054z2h.mp4',
        'https://files.catbox.moe/3ucfc0.mp4',
        'https://files.catbox.moe/brnwzh.mp4'
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
