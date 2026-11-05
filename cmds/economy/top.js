function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export default {
  command: ['top'],
  category: 'fun',
  description: 'Muestra un top aleatorio de participantes del grupo',

  run: async ({ msg, sock, text, command, args, groupMetadata }) => {

    if (command !== 'top') return;

    if (!text) {
      return msg.reply(`Ejemplo de uso: #top *texto*`);
    }

    if (!groupMetadata?.participants?.length) {
      return msg.reply('❌ No se pudo obtener la lista de participantes.');
    }

    const participants = groupMetadata.participants
      .map(v => v.id)
      .filter(Boolean);

    if (!participants.length) {
      return msg.reply('❌ No hay participantes disponibles.');
    }

    const picks = [];

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const topUsers = shuffled.slice(0, Math.min(10, shuffled.length));

    const emojis = [
      '🤓', '😅', '😂', '😳', '😎', '🥵',
      '😱', '🤑', '🙄', '💩', '🍑', '🤨',
      '🥴', '🔥', '👇🏻', '😔', '👀', '🌚'
    ];

    const x = pickRandom(emojis);

    let topMessage = `*${x} Top ${topUsers.length} ${text} ${x}*\n`;

    topUsers.forEach((id, i) => {
      topMessage += `\n*${i + 1}. @${id.split('@')[0]}*`;
      picks.push(id);
    });

    await sock.sendMessage(
      msg.chat,
      {
        text: topMessage,
        mentions: picks
      },
      {
        quoted: msg
      }
    );
  },
};
