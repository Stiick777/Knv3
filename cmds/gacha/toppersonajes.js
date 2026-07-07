import { promises as fs } from 'fs';

const charactersFilePath = './src/database/characters.json';

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('❀ No se pudo cargar el archivo characters.json.');
  }
}

export default {
  command: ['toppersonajes', 'topp'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock }) => {
    try {
      const characters = await loadCharacters();

      // Contar cuántos personajes tiene cada usuario
      const userCounts = {};

      characters.forEach(c => {
        if (c.user) {
          userCounts[c.user] = (userCounts[c.user] || 0) + 1;
        }
      });

      // Ordenar usuarios por cantidad de personajes
      const sortedUsers = Object.entries(userCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      if (sortedUsers.length === 0) {
        return await msg.reply(
          `❰❖❱ Nadie ha reclamado personajes aún. ❰❖❱`
        );
      }

      let message = `╔══════════════════════╗  
      🌟 *Top 10 Usuarios con más Personajes* 🌟  
╚══════════════════════╝\n\n`;

      sortedUsers.forEach(([user, count], index) => {
        message += `🏅 *${index + 1}.* @${user.split('@')[0]} — 🎭 *${count}* personajes\n`;
      });

      message += `\n━━━━━━━━━━━━━━━━━━━━━`;

      await sock.sendMessage(
        msg.chat,
        {
          text: message,
          mentions: sortedUsers.map(([user]) => user)
        },
        {
          quoted: msg
        }
      );

    } catch (error) {
      await msg.reply(
        `✘ Error al obtener el top de personajes: ${error.message}`
      );
    }
  },
};
