import fs from 'fs';
import path from 'path';

export default {
  command: ['preg', 'embarazar', 'preñar'],
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

    await msg.react('😏');

    let str;

    if (msg.mentionedJid.length > 0) {
      str = `\`${name2}\` embarazó a \`${name || who}\` (⊙_⊙;).`;
    } else if (msg.quoted) {
      str = `\`${name2}\` embarazó a \`${name || who}\`.`;
    } else {
      str = `\`${name2}\` se embarazó a sí mismo (⊙_⊙;).`.trim();
    }

    if (msg.isGroup) {
      let pp = 'https://files.catbox.moe/054z2h.mp4';
      let pp2 = 'https://files.catbox.moe/3ucfc0.mp4';
      let pp3 = 'https://files.catbox.moe/brnwzh.mp4';

      const videos = [pp, pp2, pp3];
      const video = videos[Math.floor(Math.random() * videos.length)];

      let mentions = [who];

      await sock.sendMessage(
        msg.chat,
        {
          video: { url: video },
          gifPlayback: true,
          caption: str,
          mentions
        },
        {
          quoted: msg
        }
      );
    }
  },
};
