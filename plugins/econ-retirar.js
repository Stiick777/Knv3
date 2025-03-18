const db = await import('../database.json', { assert: { type: "json" } });


let handler = async (m, { args }) => {
  let user = global.db.data.users[m.sender];

  if (!args[0]) return m.reply('🚩 Ingresa la cantidad de *💎 Diamantes* que deseas retirar.');

  if (args[0] == 'all') {
    let count = parseInt(user.bank);
    if (!count) return m.reply('🚩 No tienes *💎 Diamantes* en el banco.');

    user.bank -= count;
    user.diamond += count;

    await m.reply(`✅ Retiraste *${count} 💎 Diamantes* del banco.`);
    return;
  }

  if (isNaN(args[0])) return m.reply('🚩 La cantidad debe ser un número.');

  let count = parseInt(args[0]);
  if (!user.bank) return m.reply('🚩 No tienes *💎 Diamantes* en el banco.');
  if (user.bank < count) return m.reply(`🚩 Solo tienes *${user.bank} 💎 Diamantes* en el banco.`);

  user.bank -= count;
  user.diamond += count;

  await m.reply(`✅ Retiraste *${count} 💎 Diamantes* del banco.`);
};

handler.help = ['retirar'];
handler.tags = ['econ'];
handler.command = ['withdraw', 'retirar', 'wd'];
handler.group = true;

export default handler;