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
  command: ['listp', 'listpersonajes'],
  category: 'fun',
  description: '',
  run: async ({ msg }) => {
    try {
      const characters = await loadCharacters();

      const totalCharacters = characters.length;
      const claimedCharacters = characters.filter(c => c.user).length;
      const availableCharacters = totalCharacters - claimedCharacters;

      let message = `╔═════════════════════╗  
        ✦ *Información de Personajes* ✦  
╚═════════════════════╝  

📜 *Estadísticas:*  
➤ 🏆 *Total de personajes:* ${totalCharacters}  
➤ ✅ *Personajes reclamados:* ${claimedCharacters}  
➤ 🎭 *Personajes disponibles:* ${availableCharacters}  

━━━━━━━━━━━━━━━━━━━`;

      await msg.reply(message);

    } catch (error) {
      await msg.reply(
        `✘ Error al obtener información de los personajes: ${error.message}`
      );
    }
  },
};
