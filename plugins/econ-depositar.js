import db from '../database.json' assert { type: 'json' };

let handler = async (m, { args }) => {
  let user = global.db.data.users[m.sender];

  if (!args[0]) return m.reply('🚩 Ingresa la cantidad de *💎 Diamantes* que deseas depositar.');
  if ((args[0]) < 1) return m.reply('🚩 Ingresa una cantidad válida de *💎 Diamantes*.');
  
  if (args[0] == 'all') {
    let count = parseInt(user.diamond);
    if (!count) return m.reply('🚩 No tienes *💎 Diamantes* en la cartera.');
    
    user.diamond -= count;
    user.bank += count;
    
    await m.reply(`✅ Depositaste *${count} 💎 Diamantes* en el Banco.`);
    return;
  }
  
  if (isNaN(args[0])) return m.reply('🚩 La cantidad debe ser un número.');
  
  let count = parseInt(args[0]);
  if (!user.diamond) return m.reply('🚩 No tienes *💎 Diamantes* en la cartera.');
  if (user.diamond < count) return m.reply(`🚩 Solo tienes *${user.diamond} 💎 Diamantes* en la cartera.`);
  
  user.diamond -= count;
  user.bank += count;
  
  await m.reply(`✅ Depositaste *${count} 💎 Diamantes* en el Banco.`);
};

handler.help = ['depositar'];
handler.tags = ['econ'];
handler.command = ['deposit', 'depositar', 'dep', 'aguardar'];
handler.group = true;

export default handler;