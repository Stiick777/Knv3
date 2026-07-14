import { promises as fs } from 'fs';

const charactersFilePath = './core/characters.json';

const cooldowns = {};
const timestamps = {};

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
  command: ['pw'],
  category: 'fun',
  description: '',
  run: async ({ msg, sock }) => {
    const userId = msg.sender;
    const now = Date.now();

    if (cooldowns[userId] && now < cooldowns[userId]) {
      const remainingTime = Math.ceil(
        (cooldowns[userId] - now) / 1000
      );

      const minutes = Math.floor(remainingTime / 60);
      const seconds = remainingTime % 60;

      return await msg.reply(
        `⏱️ | Debes esperar *${minutes} minutos y ${seconds} segundos* para usar *#pw* de nuevo.`
      );
    }

    try {
      const characters = await loadCharacters();

      const randomCharacter =
        characters[Math.floor(Math.random() * characters.length)];

      // 🛑 Resetear timestamps antes de enviar un nuevo personaje
      Object.keys(timestamps).forEach(
        id => delete timestamps[id]
      );

      const timestamp = Date.now();

      global.timestamps[randomCharacter.id] =
        timestamp + 30000;

      console.log(
        `Se asignó timestamp a ${randomCharacter.id}: ${global.timestamps[randomCharacter.id]}`
      );

      // 📌 Verificar si el personaje está reclamado
      let statusMessage;

      if (randomCharacter.user) {
        const userTag =
          `@${randomCharacter.user.split('@')[0]}`;

        statusMessage =
          ` *Reclamado por ${userTag}*`;
      } else {
        statusMessage = ' *Libre*';
      }

      const message = `╔════════════════╗    
  ✨ *¡Nuevo Personaje Disponible!* ✨
╚════════════════╝

❀ *Nombre:* ${randomCharacter.name}
✰ *Valor:* ${randomCharacter.value} XP
♡ *Estado:* ${statusMessage}

${randomCharacter.user
  ? "🔥️ *Este personaje ya ha sido reclamado, intenta con otro*"
  : "🕒 Puedes reclamarlo con *rc* en los próximos 30 segundos"}

🔹 ID: *${randomCharacter.id}*
━━━━━━━━━━━━━━━━━━`;

      await sock.sendFile(
        msg.chat,
        randomCharacter.img,
        `${randomCharacter.name}.jpg`,
        message,
        msg,
        {
          mentions: [randomCharacter.user]
        }
      );

      cooldowns[userId] =
        now + 60 * 60 * 1000;

      // ⏳ Tiempo agotado
      setTimeout(async () => {
        if (timestamps[randomCharacter.id]) {
          delete timestamps[randomCharacter.id];

          await msg.reply(
            `⫷✦⫸ ⏳ *Tiempo Agotado* ⏳ ⫷✦⫸\nEl personaje *${randomCharacter.name}* ya no puede ser reclamado.`
          );
        }
      }, 20000);

    } catch (error) {
      await msg.reply(
        `✘ Error al cargar el personaje: ${error.message}`
      );
    }
  },
};
