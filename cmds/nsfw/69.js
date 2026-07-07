import fs from 'fs';
import path from 'path';

export default {
  command: ['sixnine', '69'],
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
      str = `\`${name2}\` está haciendo un 69 con \`${name || who}\` ( ͡° ͜ʖ ͡° )`;
    } else if (msg.quoted) {
      str = `\`${name2}\` está haciendo un 69 con \`${name || who}\`.`;
    } else {
      str = `\`${name2}\` intentó hacer un 69 solo, pero falló ( ಠ_ಠ )`;
    }

    if (msg.isGroup) {
      let pp = 'https://telegra.ph/file/bb4341187c893748f912b.mp4';
      let pp2 = 'https://telegra.ph/file/c7f154b0ce694449a53cc.mp4';
      let pp3 = 'https://telegra.ph/file/1101c595689f638881327.mp4';
      let pp4 = 'https://telegra.ph/file/f7f2a23e9c45a5d6bf2a1.mp4';
      let pp5 = 'https://telegra.ph/file/a2098292896fb05675250.mp4';
      let pp6 = 'https://telegra.ph/file/16f43effd7357e82c94d3.mp4';
      let pp7 = 'https://telegra.ph/file/55cb31314b168edd732f8.mp4';
      let pp8 = 'https://telegra.ph/file/1cbaa4a7a61f1ad18af01.mp4';
      let pp9 = 'https://telegra.ph/file/1083c19087f6997ec8095.mp4';

      const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8, pp9];
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
