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

async function saveCharacters(characters) {
  try {
    await fs.writeFile(
      charactersFilePath,
      JSON.stringify(characters, null, 2),
      'utf-8'
    );
  } catch (error) {
    throw new Error('❀ No se pudo guardar el archivo characters.json.');
  }
}

// Función para normalizar el nombre
function normalizeText(text) {
  return text.trim().toLowerCase().replace(/\s+/g, ' ');
}

export default {
  command: ['sell', 'vender'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock, args }) => {
    const userId = msg.sender;

    if (!args[0]) {
      return await msg.reply(
        `⫷✦⫸ Debes escribir el nombre del personaje que deseas vender. ⫷✦⫸  
✧ Ejemplo: *#sell neko*`
      );
    }

    const characterName = normalizeText(args.join(' '));

    try {
      const characters = await loadCharacters();

      const character = characters.find(
        c => normalizeText(c.name) === characterName
      );

      if (!character) {
        return await msg.reply(
          `⟪✦⟫ No se encontró el personaje ⟪ *${args.join(' ')}* ⟫. ⟪✦⟫`
        );
      }

      if (character.user !== userId) {
        return await msg.reply(
          `⫷✦⫸ No puedes vender ⟪ *${character.name}* ⟫ porque no te pertenece. ⫷✦⫸`
        );
      }

      const characterValue = character.value || 0;

      // Liberar personaje
      character.user = null;
      character.status = 'Libre';

      // Dar XP
      global.db.data.users[userId].exp += characterValue;

      await saveCharacters(characters);

      const message = `╔════════════════════╗  
      💰 *¡Personaje Vendido!* 💰  
╚════════════════════╝  

✦ Has vendido a *${character.name}* por *${characterValue}* XP.  

🔄 Ahora el personaje está disponible para que otros lo reclamen.  

━━━━━━━━━━━━━━━━━━`;

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

    } catch (error) {
      await msg.reply(
        `✘ Error al vender el personaje: ${error.message}`
      );
    }
  },
};
