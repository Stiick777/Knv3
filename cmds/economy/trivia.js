
import fs from 'fs';
import db from '#db';

const gam = new Map();

function cargarPreguntas() {
  try {
    const data = fs.readFileSync('../../trivia.json', 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error cargando preguntas de trivia:', error.message);
    return [];
  }
}

function elegirPreguntaAleatoria(preguntas) {
  return preguntas[Math.floor(Math.random() * preguntas.length)];
}

export default {
  command: ['trivia'],
  category: 'fun',
  description: 'Responde preguntas y gana Coins.',

  run: async ({ msg, sock, usedPrefix }) => {
    const chat = db.getChat(msg.chat);

    if (chat.adminonly || !chat.economy) {
      return msg.reply(
        `ꕥ Los comandos de *Economía* están desactivados en este grupo.\n\nUn *administrador* puede activarlos con el comando:\n» *${usedPrefix}economy on*`
      );
    }

    if (gam.has(msg.sender)) {
      return msg.reply('⚠️ Ya tienes una trivia en curso. ¡Responde antes de iniciar otra!');
    }

    const preguntas = cargarPreguntas();

    if (!preguntas.length) {
      return msg.reply('⚠️ No hay preguntas disponibles en este momento.');
    }

    const pregunta = elegirPreguntaAleatoria(preguntas);

    const tiempoExpira = setTimeout(async () => {
      const juego = gam.get(msg.sender);

      if (!juego) return;

      try {
        await sock.sendMessage(
          juego.chat,
          {
            text: `⏳ ¡Tiempo agotado! La respuesta correcta era *${juego.pregunta.respuestaCorrecta.toUpperCase()}*`
          },
          { quoted: juego.msg }
        );
      } catch (error) {
        console.error('Error al finalizar trivia:', error.message);
      }

      gam.delete(msg.sender);
    }, 60000);

    gam.set(msg.sender, {
      pregunta,
      tiempoExpira,
      chat: msg.chat,
      msg
    });

    let mensaje = `🎲 *Trivia - KanBot*\n\n*${pregunta.pregunta}*\n\n`;

    for (const [key, value] of Object.entries(pregunta.opciones)) {
      mensaje += `*${key.toUpperCase()}.* ${value}\n`;
    }

    mensaje += '\n📌 *Responde con A, B o C en 1 minuto.*';

    await msg.reply(mensaje);
  },

  before: async ({ msg, sock }) => {
    const juego = gam.get(msg.sender);

    if (!juego) return;

    if (msg.chat !== juego.chat) return;

    const respuestaUsuario = (msg.text || '').toLowerCase().trim();

    if (!['a', 'b', 'c'].includes(respuestaUsuario)) return;

    const respuestaCorrecta = juego.pregunta.respuestaCorrecta.toLowerCase();

    clearTimeout(juego.tiempoExpira);
    gam.delete(msg.sender);

    if (respuestaUsuario === respuestaCorrecta) {
      const reward = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;

      const botId = sock?.user?.id.split(':')[0] + '@s.whatsapp.net';
      const botSettings = db.getSettings(botId);
      const monedas = botSettings?.currency || 'Coins';

      db.setCreate('chat_users', [msg.chat, msg.sender], 'coins', 0);

      const user = db.getChatUser(msg.chat, msg.sender);

      user.coins = (user.coins || 0) + reward;

      db.setChatUser(msg.chat, msg.sender, 'coins', user.coins);

      return msg.reply(
        `🎉 ¡Correcto! ✅ La respuesta era *${respuestaCorrecta.toUpperCase()}*\n\n✨ Has ganado *+${reward.toLocaleString()} ${monedas}* 💰`
      );
    }

    return msg.reply(
      `❌ Incorrecto. La respuesta correcta era *${respuestaCorrecta.toUpperCase()}*`
    );
  }
};
