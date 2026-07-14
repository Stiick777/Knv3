import { promises as fs } from 'fs';

const charactersFilePath = './core/characters.json';

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('❀ No se pudo cargar el archivo characters.json.');
  }
}

export default {
  command: ['mp'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock, command }) => {
    const userId = msg.sender;

    try {
      const characters = await loadCharacters();
      const userCharacters = characters.filter(c => c.user === userId);

      if (userCharacters.length === 0) {
        return await msg.reply(
          `⫷✦⫸ No tienes personajes reclamados. ⫷✦⫸`
        );
      }

      const pageSize = 10;
      const pageMatch = command.match(/\d+$/);
      const page = pageMatch ? parseInt(pageMatch[0]) : 1;

      const totalPages = Math.ceil(userCharacters.length / pageSize);

      // 🚫 Si el usuario pidió una página que no existe
      if (page < 1 || page > totalPages) return;

      const startIndex = (page - 1) * pageSize;
      const paginatedCharacters = userCharacters.slice(
        startIndex,
        startIndex + pageSize
      );

      let message = `⫷✨⫸ *Tus Personajes Reclamados: ${userCharacters.length}* ⫷✨⫸\n\n`;

      paginatedCharacters.forEach((char, index) => {
        message += `⭐ *${startIndex + index + 1}.* ${char.name} ─ 🏆 Valor: *${char.value}* XP\n`;
      });

      message += `\n📄 Página ${page} de ${totalPages}`;

      if (page < totalPages) {
        message += `\n➡ Usa *.mp${page + 1}* para ver la siguiente página.`;
      }

      await msg.reply(message);

    } catch (error) {
      console.error(error);
    }
  },
};
