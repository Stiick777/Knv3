import db from '#db';

export default {
  command: ['hug', 'abrazar'],
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
    const name2 = getName(msg.sender) || msg.pushName || msg.sender.split('@')[0];

    await msg.react('🫂');

    let str;

    if (msg.mentionedJid?.length > 0) {
      str = `\`${name2}\` abrazó a \`${name}\``;
    } else if (msg.quoted) {
      str = `\`${name2}\` abrazó a \`${name}\``;
    } else {
      str = `\`${name2}\` se abrazó a sí mismo.`;
    }

    if (msg.isGroup) {
      const videos = [
        'https://telegra.ph/file/56d886660696365f9696b.mp4',
        'https://telegra.ph/file/3e443a3363a90906220d8.mp4',
        'https://telegra.ph/file/6bc3cd10684f036e541ed.mp4',
        'https://telegra.ph/file/0e5b24907be34da0cbe84.mp4',
        'https://telegra.ph/file/6a3aa01fabb95e3558eec.mp4',
        'https://telegra.ph/file/5866f0929bf0c8fe6a909.mp4',
        'https://telegra.ph/file/436624e53c5f041bfd597.mp4',
        'https://telegra.ph/file/3eeadd9d69653803b33c6.mp4'
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
