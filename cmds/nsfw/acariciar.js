
export default {
  command: ['pat', 'acariciar'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock }) => {
    let who;

    if (msg.isGroup) {
      who = msg.mentionedJid[0]
        ? msg.mentionedJid[0]
        : msg.quoted
        ? msg.quoted.sender
        : false;
    } else {
      who = msg.chat;
    }

    if (!who) throw 'Etiqueta o menciona a alguien';

    let user = global.db.data.users[who];
    let name = sock.getName(who);
    let name2 = sock.getName(msg.sender);

    await msg.react('💆🏻');

    let str;

    if (msg.mentionedJid.length > 0) {
      str = `\`${name2}\` acarició a \`${name || who}\``;
    } else if (msg.quoted) {
      str = `\`${name2}\` acarició a \`${name || who}\``;
    } else {
      str = `\`${name2}\` se acarició a sí mismo ( ⚆ _ ⚆ ).`.trim();
    }

    if (msg.isGroup) {
      let pp = 'https://telegra.ph/file/f75aed769492814d68016.mp4';
      let pp2 = 'https://telegra.ph/file/4f24bb58fe580a5e97b0a.mp4';
      let pp3 = 'https://telegra.ph/file/30206abdcb7b8a4638510.mp4';
      let pp4 = 'https://telegra.ph/file/ecd7aeae5b2242c660d41.mp4';
      let pp5 = 'https://telegra.ph/file/6d3ba201bcdd1fd2c1408.mp4';
      let pp6 = 'https://telegra.ph/file/d5dbdcf845d2739dbe45e.mp4';
      let pp7 = 'https://telegra.ph/file/c9a529908d4e0b71d7c5a.mp4';
      let pp8 = 'https://telegra.ph/file/b7bc277ddef1af913827c.mp4';
      let pp9 = 'https://telegra.ph/file/8b01e180dfb7e98d5a4f8.mp4';
      let pp10 = 'https://telegra.ph/file/901f13852aa65f9628d96.mp4';

      const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8, pp9, pp10];
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
