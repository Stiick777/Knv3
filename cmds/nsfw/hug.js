import fs from 'fs';
import path from 'path';

export default {
  command: ['hug', 'abrazar'],
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

    await msg.react('🫂');

    let str;

    if (msg.mentionedJid.length > 0) {
      str = `\`${name2}\` abrazó a \`${name || who}\``;
    } else if (msg.quoted) {
      str = `\`${name2}\` abrazó a \`${name || who}\`.`;
    } else {
      str = `\`${name2}\` se abrazó a sí mismo.`.trim();
    }

    if (msg.isGroup) {
      let pp = 'https://telegra.ph/file/56d886660696365f9696b.mp4';
      let pp2 = 'https://telegra.ph/file/3e443a3363a90906220d8.mp4';
      let pp3 = 'https://telegra.ph/file/6bc3cd10684f036e541ed.mp4';
      let pp4 = 'https://telegra.ph/file/0e5b24907be34da0cbe84.mp4';
      let pp5 = 'https://telegra.ph/file/6a3aa01fabb95e3558eec.mp4';
      let pp6 = 'https://telegra.ph/file/5866f0929bf0c8fe6a909.mp4';
      let pp7 = 'https://telegra.ph/file/436624e53c5f041bfd597.mp4';
      let pp8 = 'https://telegra.ph/file/3eeadd9d69653803b33c6.mp4';

      const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8];
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
