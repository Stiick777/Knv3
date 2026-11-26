
import db from '#db';

export default {
  command: ['suckboobs', 'chupartetas'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock, groupMetadata }) => {

    let who;

    if (msg.mentionedJid?.length > 0) {
      who = msg.mentionedJid[0];
    } else if (msg.quoted) {
      who = msg.quoted.sender;
    } else {
      return msg.reply('《✧》 Etiqueta o responde al mensaje de alguien.');
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

    const str = `\`${name2}\` le está chupando las tetas a \`${name}\``.trim();

    if (msg.isGroup) {

      const videos = [
        'https://telegra.ph/file/1104aa065e51d29a5fb4f.mp4',
        'https://telegra.ph/file/f8969e557ad07e7e53f1a.mp4',
        'https://telegra.ph/file/f8cf75586670483fadc1d.mp4',
        'https://telegra.ph/file/7b181cbaa54eee6c048fc.mp4',
        'https://telegra.ph/file/01143878beb3d0430c33e.mp4',
        'https://telegra.ph/file/9827c7270c9ceddb8d074.mp4',
        'https://telegra.ph/file/95efbd8837aa18f3e2bde.mp4',
        'https://telegra.ph/file/b178b294a963d562bb449.mp4',
        'https://telegra.ph/file/949dff632250307033b2e.mp4',
        'https://telegra.ph/file/9e1240c29f3a6a9867aaa.mp4'
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
