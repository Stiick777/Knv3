import db from '#db';

export default {
  command: ['daily', 'claim'],
  category: 'rpg',
  description: 'Reclamar recompensa diaria.',
  run: async ({ msg, sock, isPrems }) => {
    db.setCreate('users', msg.sender, 'exp', 0);
    db.setCreate('users', msg.sender, 'estrellas', 0);
    db.setCreate('users', msg.sender, 'lastclaim', 0);

    const user = db.getUser(msg.sender);

    const exp = pickRandom([500, 600, 700, 800, 900, 999, 1000, 1300, 1500, 1800, 2000, 2500, 3000]);
    const exppremium = pickRandom([3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000]);
    const estrellas = Math.floor(Math.random() * 3000) + 100;

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (now < user.lastclaim + oneDay) {
      return msg.reply(
        `🕚 *Vuelve en ${msToTime((user.lastclaim + oneDay) - now)}*`
      );
    }

    db.setUser(
      msg.sender,
      'exp',
      (user.exp || 0) + (isPrems ? exppremium : exp)
    );

    db.setUser(
      msg.sender,
      'estrellas',
      (user.estrellas || 0) + estrellas
    );

    db.setUser(msg.sender, 'lastclaim', now);

    await msg.reply(
`🎁 *Recompensa Diaria*

📜 Recursos:
✨ *XP:* +${isPrems ? exppremium : exp} ⚡
⭐ *Estrellas:* +${estrellas} 🌟`
    );
  },
};

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60);
  let minutes = Math.floor((duration / (1000 * 60)) % 60);
  let hours = Math.floor(duration / (1000 * 60 * 60));

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return `${hours} Horas ${minutes} Minutos`;
}
