import { promises as fs } from 'fs';

const charactersFilePath = './core/characters.json';
const cooldowns = {};

// 🔹 Usar `global.timestamps` para compartir entre archivos
if (!global.timestamps) global.timestamps = {};

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

export default {
  command: ['rc'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock }) => {
    const userId = msg.sender;
    const now = Date.now();

    if (cooldowns[userId] && now < cooldowns[userId]) {
      const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000);
      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;

      return await msg.reply(
        `⫷✦⫸ Debes esperar ⏳ *${minutes} minutos y ${seconds} segundos* para usar *#rc* de nuevo. ⫷✦⫸`
      );
    }

    if (msg.quoted && msg.quoted.sender === sock.user.jid) {
      try {
        const characters = await loadCharacters();

        const characterIdMatch = msg.quoted.text.match(/ID: \*(.+?)\*/);

        if (!characterIdMatch) {
          return await msg.reply(
            `⫷✦⫸ El mensaje citado no es un personaje válido. ⫷✦⫸`
          );
        }

        const characterId = characterIdMatch[1];
        const character = characters.find(c => c.id === characterId);

        if (!character) {
          return await msg.reply(
            '《✧》El personaje no existe.'
          );
        }

        // 🔹 Verificar si el personaje ya fue reclamado
        if (character.user) {
          const userTag = `@${character.user.split('@')[0]}`;

          return await sock.sendMessage(
            msg.chat,
            {
              text: `⫷✦⫸ ❌ *Este personaje ya ha sido reclamado.* ❌\nFue reclamado por ${userTag}.`,
              mentions: [character.user]
            },
            {
              quoted: msg
            }
          );
        }

        // 🔹 Verificar si el tiempo ha expirado
        const expirationTime = global.timestamps[character.id] || 0;

        if (now > expirationTime) {
          delete global.timestamps[character.id];

          return await msg.reply(
            `⫷✦⫸ ⏳ *Tiempo Agotado* ⏳ ⫷✦⫸\nEl personaje *${character.name}* ya no puede ser reclamado.`
          );
        }

        // 🔹 Verificar XP
        const userXP = global.db.data.users[userId]?.exp || 0;

        if (userXP < character.value) {
          const xpFaltante = character.value - userXP;

          return await msg.reply(
`⫷✦⫸ No tienes suficiente XP para reclamar a *${character.name}* ❌.

🔹 Necesitas: ${character.value} XP
🔸 Tienes: ${userXP} XP
❗ Te falta: ${xpFaltante} XP

✨ ¡Sigue acumulando XP y vuelve a intentarlo! ⫷✦⫸`
          );
        }

        // Restar XP y asignar personaje
        global.db.data.users[userId].exp -= character.value;
        character.user = userId;
        character.status = "Reclamado";

        await saveCharacters(characters);

        delete global.timestamps[character.id];

        await msg.reply(
          `⫷✨⫸ ¡Has reclamado a *${character.name}* con éxito! 🎉`
        );

        cooldowns[userId] = now + 1 * 60 * 1000;

      } catch (error) {
        await msg.reply(
          `✘ Error al reclamar el personaje: ${error.message}`
        );
      }
    } else {
      await msg.reply(
        `✖︎ 》 Debes citar un personaje válido para reclamar. 《 ✖︎`
      );
    }
  },
};
