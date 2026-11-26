
import db from '#db';

export default {
  command: ['chuparpata', 'chupaepatas'],
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

    await msg.react('👣');

    let str;

    if (msg.mentionedJid?.length > 0) {
      str = `\`${name2}\` está chupando la pata de \`${name}\`. 😆🦶`;
    } else if (msg.quoted) {
      str = `\`${name2}\` está chupando la pata de \`${name}\`. 🥵🦶`;
    } else {
      str = `\`${name2}\` está chupando patas por aquí 🥵.`;
    }

    if (msg.isGroup) {

      const videos = [
        'https://files.catbox.moe/zuwr3w.mp4',
        'https://files.catbox.moe/vkllyl.mp4',
        'https://files.catbox.moe/es3aji.mp4'
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
    }
  },
};
