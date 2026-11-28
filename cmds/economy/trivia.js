
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
  return String(
    msg.text ||
    msg.body ||
    msg.msg?.text ||
    msg.msg?.conversation ||
    ''
  ).trim().toLowerCase();
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

    let mensaje = `🎲 *Trivia - KanBot*\n\n*${pregunta.pregunta}*\n\n`;

    for (const [key, value] of Object.entries(pregunta.opciones)) {
      mensaje += `*${key.toUpperCase()}.* ${value}\n`;
    }

    mensaje += '\n📌 *Responde citando este mensaje con A, B o C en 1 minuto.*';

    // Enviar y obtener el verdadero mensaje de la pregunta.
    const preguntaMsg = await msg.reply(mensaje);

    if (!preguntaMsg?.key?.id) {
      return msg.reply('⚠️ No se pudo iniciar la trivia. Inténtalo nuevamente.');
    }

    const juego = {
      pregunta,
      chat: msg.chat,
      preguntaMsg,
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
          { quoted: juego.preguntaMsg }
        );
      } catch (error) {
        console.error('Error al finalizar trivia:', error.message);
      }

      gam.delete(msg.sender);
    }, 60000);

    gam.set(msg.sender, juego);
  },

  before: async ({ msg, sock }) => {
    console.log('[TRIVIA BEFORE]', {
  sender: msg.sender,
  chat: msg.chat,
  text: msg.text,
  quotedId: msg.quoted?.id
});
    try {
      const juego = gam.get(msg.sender);

      if (!juego) return;
      if (msg.chat !== juego.chat) return;

      const respuestaUsuario = obtenerRespuesta(msg);

      if (!['a', 'b', 'c'].includes(respuestaUsuario)) return;

      // Comprobar que realmente está citando la pregunta.
      if (!msg.quoted) return;

      const idPregunta = juego.preguntaMsg.key.id;
      const idCitado = msg.quoted.id || msg.quoted.key?.id;

      if (!idCitado || idCitado !== idPregunta) return;

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
