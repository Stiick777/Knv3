
import fs from 'fs';
import db from '#db';

const gam = new Map();

function cargarPreguntas() {
  try {
    const data = fs.readFileSync('./core/trivia.json', 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error cargando preguntas de trivia:', error.message);
    return [];
  }
}

function elegirPreguntaAleatoria(preguntas) {
  return preguntas[Math.floor(Math.random() * preguntas.length)];
}

function obtenerRespuesta(msg) {
  const texto =
    msg.text ||
    msg.body ||
    msg.msg?.text ||
    msg.msg?.conversation ||
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    '';

  return String(texto).trim().toLowerCase();
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
      return msg.reply(
        '⚠️ Ya tienes una trivia en curso. ¡Responde antes de iniciar otra!'
      );
    }

    const preguntas = cargarPreguntas();

    if (!preguntas.length) {
      return msg.reply('⚠️ No hay preguntas disponibles en este momento.');
    }

    const pregunta = elegirPreguntaAleatoria(preguntas);

    const juego = {
      pregunta,
      chat: msg.chat,
      msg,
      tiempoExpira: null
    };

    juego.tiempoExpira = setTimeout(async () => {
      if (gam.get(msg.sender) !== juego) return;

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

    gam.set(msg.sender, juego);

    let mensaje = `🎲 *Trivia - KanBot*\n\n*${pregunta.pregunta}*\n\n`;

    for (const [key, value] of Object.entries(pregunta.opciones)) {
      mensaje += `*${key.toUpperCase()}.* ${value}\n`;
    }

    mensaje += '\n📌 *Responde citando este mensaje con A, B o C en 1 minuto.*';

    await msg.reply(mensaje);
  },

  before: async ({ msg, sock }) => {
    try {
      const juego = gam.get(msg.sender);

      if (!juego) return;
      if (msg.chat !== juego.chat) return;

      const respuestaUsuario = obtenerRespuesta(msg);

      if (!['a', 'b', 'c'].includes(respuestaUsuario)) return;

      // Comprobar que el usuario citó el mensaje de la trivia
      if (!msg.quoted) return;

      const idTrivia = juego.msg.key?.id || juego.msg.id;
      const idCitado = msg.quoted.id;

      if (!idTrivia || !idCitado || idTrivia !== idCitado) return;

      const respuestaCorrecta = String(
        juego.pregunta.respuestaCorrecta
      ).trim().toLowerCase();

      clearTimeout(juego.tiempoExpira);
      gam.delete(msg.sender);

      if (respuestaUsuario === respuestaCorrecta) {
        const reward = Math.floor(Math.random() * (10000 - 3000 + 1)) + 3000;

        const botId = sock?.user?.id?.split(':')[0] + '@s.whatsapp.net';
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

    } catch (error) {
      console.error('Error en respuestas de trivia:', error.message);
    }
  }
};
