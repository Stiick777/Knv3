
import db from '#db';

export default {
  command: ['sixnine', '69'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock, groupMetadata }) => {

    let who;

    if (msg.mentionedJid?.length > 0) {
      who = msg.mentionedJid[0];
    } else if (msg.quoted) {
      who = msg.quoted.sender;
    } else {
      who = msg.sender;
    }

    const getName = (jid) => {
      return (
        db.getUser(jid)?.name ||
        groupMetadata?.participants?.find(p => p.id === jid)?.name ||
        jid.split('@')[0]
      );
    };

    const name = getName(who);
    const name2 = db.getUser(msg.sender)?.name || msg.pushName || msg.sender.split('@')[0];

    await msg.react('🔥');

    let str;

    if (msg.mentionedJid?.length > 0) {
      str = `\`${name2}\` está haciendo un 69 con \`${name}\` ( ͡° ͜ʖ ͡° )`;
    } else if (msg.quoted) {
      str = `\`${name2}\` está haciendo un 69 con \`${name}\`.`;
    } else {
      str = `\`${name2}\` intentó hacer un 69 solo, pero falló ( ಠ_ಠ )`;
    }

    if (msg.isGroup) {
      const videos = [
        'https://telegra.ph/file/bb4341187c893748f912b.mp4',
        'https://telegra.ph/file/c7f154b0ce694449a53cc.mp4',
        'https://telegra.ph/file/1101c595689f638881327.mp4',
        'https://telegra.ph/file/f7f2a23e9c45a5d6bf2a1.mp4',
        'https://telegra.ph/file/a2098292896fb05675250.mp4',
        'https://telegra.ph/file/16f43effd7357e82c94d3.mp4',
        'https://telegra.ph/file/55cb31314b168edd732f8.mp4',
        'https://telegra.ph/file/1cbaa4a7a61f1ad18af01.mp4',
        'https://telegra.ph/file/1083c19087f6997ec8095.mp4'
      ];

      const video = videos[Math.floor(Math.random() * videos.length)];

      await sock.sendMessage(
        msg.chat,
        {
          video: { url: video },
          gifPlayback: true,
          caption: str,
          mentions: [msg.sender, who]
        },
        {
          quoted: msg
        }
      );
    } else {
      await msg.reply('《✧》 Este comando solo puede usarse en grupos.');
    }
  },
};
