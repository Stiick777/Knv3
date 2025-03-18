const ro = 30;

const handler = async (m, { conn, usedPrefix, command }) => {
  const user = global.db.data.users[m.sender];
  const time = user.lastrob2 + 7200000;

  if (new Date() - user.lastrob2 < 7200000) {
    conn.reply(m.chat, `🕛 𝑯𝒆𝒚! 𝑬𝒔𝒑𝒆𝒓𝒂 ${msToTime(time - new Date())} 𝒑𝒂𝒓𝒂 𝒗𝒐𝒍𝒗𝒆𝒓 𝒂 𝒓𝒐𝒃𝒂𝒓.`, m);
    return;
  }

  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  } else {
    who = m.chat;
  }

  if (!who) {
    conn.reply(m.chat, '💡 𝑬𝒕𝒊𝒒𝒖𝒆𝒕𝒂 𝒂 𝒂𝒍𝒈𝒖𝒊𝒆𝒏 𝒑𝒂𝒓𝒂 𝒓𝒐𝒃𝒂𝒓.', m);
    return;
  }

  if (!(who in global.db.data.users)) {
    conn.reply(m.chat, '💡 𝑬𝒍 𝒖𝒔𝒖𝒂𝒓𝒊𝒐 𝒏𝒐 𝒔𝒆 𝒆𝒏𝒄𝒖𝒆𝒏𝒕𝒓𝒂 𝒆𝒏 𝒎𝒊 𝒃𝒂𝒔𝒆 𝒅𝒆 𝒅𝒂𝒕𝒐𝒔 😕.', m);
    return;
  }

  const targetUser = global.db.data.users[who];
  const robAmount = Math.floor(Math.random() * ro);

  if (targetUser.diamond < robAmount) {
    return conn.reply(m.chat, `😔 @${who.split`@`[0]} 𝒕𝒊𝒆𝒏𝒆 𝒎𝒆𝒏𝒐𝒔 𝒅𝒆 *${ro} 💎 Diamantes*\n𝑵𝒐 𝒓𝒐𝒃𝒆𝒔 𝒂 𝒖𝒏 𝒑𝒐𝒃𝒓𝒆 🥺`, m, { mentions: [who] });
  }

  user.diamond += robAmount;
  targetUser.diamond -= robAmount;

  conn.reply(m.chat, `🔥 𝑹𝒐𝒃𝒂𝒔𝒕𝒆 *${robAmount} 💎 Diamantes* 𝒂 @${who.split`@`[0]}!`, m, { mentions: [who] });

  user.lastrob2 = new Date() * 1;
};

handler.help = ['rob2'];
handler.tags = ['econ'];
handler.command = ['robar2', 'rob2'];

export default handler;

function msToTime(duration) {
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  hours = (hours < 10) ? '0' + hours : hours;
  minutes = (minutes < 10) ? '0' + minutes : minutes;
  return hours + ' Hora(s) ' + minutes + ' Minuto(s)';
}