
import db from '#db';

export default {
  command: ['violar', 'perra'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock, groupMetadata }) => {

    if (msg.isGroup) {
      const chat = db.getChat(msg.chat);

      
    }

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

    await msg.react('🥵');

    let str;

    if (msg.mentionedJid?.length > 0) {
      str = `\`${name2}\` tuvo un encuentro íntimo con \`${name}\` mientras le decía que quería repetirlo...`;
    } else if (msg.quoted) {
      str = `\`${name2}\` tuvo un encuentro íntimo con \`${name}\` mientras le decía que quería repetirlo...`;
    } else {
      str = `\`${name2}\` tuvo un encuentro inesperado con alguien random del grupo.`;
    }

    if (msg.isGroup) {

      const videos = [
        'https://files.catbox.moe/cnmn0x.jpg',
        'https://files.catbox.moe/xph5x5.mp4',
        'https://files.catbox.moe/4ffxj8.mp4',
        'https://files.catbox.moe/f6ovgb.mp4',
        'https://qu.ax/XmLe.mp4',
        'https://qu.ax/yiMt.mp4',
        'https://qu.ax/cdKQ.mp4'
      ];

      const video = videos[Math.floor(Math.random() * videos.length)];

      const isImage = video.endsWith('.jpg');

      await sock.sendMessage(
        msg.chat,
        isImage
          ? {
              image: { url: video },
              caption: str,
              mentions: [msg.sender, who]
            }
          : {
              video: { url: video },
              gifPlayback: true,
              caption: str,
              mentions: [msg.sender, who]
            },
        {
          quoted: msg
        }
      );
    }
  },
};
