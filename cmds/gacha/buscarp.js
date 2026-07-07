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
  command: ['buscarp'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock, text }) => {
    if (!text) {
      return await msg.reply(
        '⫷✦⫸ Debes escribir el nombre o el ID de un personaje para buscarlo. ⫷✦⫸'
      );
    }

    try {
      const characters = await loadCharacters();

      // Filtrar por nombre o ID
      const filteredCharacters = characters.filter(
        c =>
          c.name.toLowerCase().includes(text.toLowerCase()) ||
          c.id === text
      );

      if (filteredCharacters.length === 0) {
        return await msg.reply(
          `⫷✦⫸ No se encontró ningún personaje con el nombre o ID *${text}*. ⫷✦⫸`
        );
      }

      // Si hay más de un resultado
      if (filteredCharacters.length > 1) {
        let message = `⫷✦⫸ Se encontraron *${filteredCharacters.length}* personajes con el nombre o ID similar a *"${text}"*:\n\n`;

        filteredCharacters.forEach((char, index) => {
          message += `🔹 *${index + 1}.* ${char.name} (ID: ${char.id})\n`;
        });

        message += `\n⫷✦⫸ *Escribe el nombre exacto o usa el ID para buscarlo nuevamente.*`;

        return await msg.reply(message);
      }

      // Si solo hay un resultado
      const character = filteredCharacters[0];
      const estado = character.user ? '❌ No' : '✅ Si';

      let message = `╔════════════════╗\n`;
      message += `  ✨ *Personaje Encontrado* ✨\n`;
      message += `╚════════════════╝\n\n`;
      message += `❀ *Nombre:* ${character.name}\n`;
      message += `✰ *Valor:* ${character.value} XP\n`;
      message += `🔹 *ID:* ${character.id}\n`;
      message += `♡ *Disponible:* ${estado}\n`;
      message += `━━━━━━━━━━━━━━━━━━`;

      if (character.img) {
        await sock.sendMessage(
          msg.chat,
          {
            image: { url: character.img },
            caption: message
          },
          {
            quoted: msg
          }
        );
      } else {
        await msg.reply(message);
      }

    } catch (error) {
      await msg.reply(
        `✘ Error al buscar el personaje: ${error.message}`
      );
    }
  },
};
