
import db from '#db';
import similarity from 'similarity';

const equipos = [
  // Europa
  'Real Madrid', 'Barcelona', 'Manchester United', 'Liverpool', 'PSG', 'Bayern Múnich',
  'Juventus', 'Chelsea', 'Inter de Milán', 'AC Milan', 'Arsenal', 'Atlético de Madrid',
  'Borussia Dortmund', 'Tottenham', 'Napoli', 'Roma', 'Sevilla', 'Lazio', 'Ajax', 'Benfica',
  'Porto', 'Sporting Lisboa', 'Shakhtar Donetsk', 'Zenit', 'Celtic', 'Rangers',
  'Galatasaray', 'Fenerbahçe', 'Olympique de Marsella', 'Lyon', 'Red Bull Salzburg',
  'RB Leipzig', 'Newcastle United', 'Aston Villa', 'Everton', 'Leicester City',
  'West Ham United', 'Villarreal', 'Real Sociedad', 'Braga', 'PSV Eindhoven',
  'Feyenoord', 'Anderlecht', 'Club Brugge', 'Besiktas', 'Dynamo Kiev', 'Spartak Moscú',
  'CSKA Moscú', 'Bayer Leverkusen', 'Wolfsburgo', 'Eintracht Frankfurt', 'Lille',
  'Monaco', 'Nice', 'Stuttgart', 'Schalke 04', 'Valencia', 'Real Betis', 'Athletic Bilbao',
  'Fiorentina', 'Torino', 'Atalanta', 'Bordeaux', 'Olympiacos', 'PAOK', 'Genk', 'Standard Lieja',

  // América
  'Boca Juniors', 'River Plate', 'Flamengo', 'Palmeiras', 'Santos', 'Corinthians',
  'São Paulo', 'Gremio', 'Tigres UANL', 'Monterrey', 'América', 'Cruz Azul',
  'Pumas UNAM', 'Chivas', 'Colo Colo', 'Universidad de Chile', 'Universitario',
  'Alianza Lima', 'Emelec', 'Barcelona SC', 'Liga de Quito', 'Deportivo Cali',
  'Atlético Nacional', 'Millonarios', 'Independiente Medellín', 'Cerro Porteño',
  'Olimpia', 'Bolívar', 'The Strongest', 'Peñarol', 'Nacional de Uruguay',
  'Defensa y Justicia', 'Racing Club', 'Independiente', 'San Lorenzo',
  'Internacional de Porto Alegre', 'Fortaleza', 'Atlético Mineiro', 'Fluminense',

  // África
  'Al Ahly', 'Zamalek', 'Raja Casablanca', 'Wydad Casablanca', 'Espérance de Tunis',
  'Étoile du Sahel', 'Orlando Pirates', 'Kaizer Chiefs', 'Mamelodi Sundowns',
  'TP Mazembe', 'AS Vita Club', 'Al Hilal Omdurman',

  // Asia
  'Al Hilal', 'Al Nassr', 'Persepolis', 'Esteghlal', 'Al Sadd', 'Al Duhail',
  'Urawa Red Diamonds', 'Kashima Antlers', 'Yokohama F. Marinos', 'Guangzhou Evergrande',
  'Shanghai Port', 'Jeonbuk Hyundai Motors', 'Suwon Bluewings', 'FC Seoul',

  // Oceanía
  'Auckland City', 'Sydney FC', 'Melbourne Victory', 'Wellington Phoenix',

  // MLS y Concacaf
  'LA Galaxy', 'Los Angeles FC', 'New York City FC', 'New York Red Bulls', 'Seattle Sounders',
  'Atlanta United', 'Inter Miami', 'Toronto FC', 'Club León', 'Toluca', 'Saprissa',
  'Herediano', 'Motagua', 'Olimpia', 'Real España',

  // Clubes históricos o en ascenso
  'Nottingham Forest', 'Sheffield United', 'Leeds United', 'Blackburn Rovers',
  'Derby County', 'Parma', 'Red Star Belgrade', 'Steaua Bucarest', 'Maribor', 'Basel'
];

const partidos = new Map();
const ultimoPartido = new Map();

const timeout = 300000;
const limiteDiario = 86400000;

const APUESTA = 1000;
const PREMIO_EXACTO = 20000;
const PREMIO_CERCANO = 5000;
const umbralSimilitud = 0.8;

export default {
  command: ['partido', 'voto', 'marcador', 'delp'],
  category: 'fun',
  description: 'Apuesta en partidos de fútbol y gana Coins.',

  run: async ({ msg, sock, args, command, usedPrefix }) => {
    const chat = db.getChat(msg.chat);

  

    const id = msg.sender;
    const ahora = Date.now();

    const botId = (sock?.user?.id || '').split(':')[0] + '@s.whatsapp.net';
    const botSettings = db.getSettings(botId);
    const monedas = botSettings?.currency || 'Coins';

    // Iniciar partido
    if (command === 'partido') {
      if (partidos.has(id)) {
        return msg.reply('⚠️ Ya tienes un partido en curso. Espera a que termine.');
      }

      const ultimo = ultimoPartido.get(id);

      if (ultimo && ahora - ultimo < limiteDiario) {
        const tiempoRestante = limiteDiario - (ahora - ultimo);

        const horas = Math.floor(tiempoRestante / 3600000);
        const minutos = Math.floor((tiempoRestante % 3600000) / 60000);
        const segundos = Math.floor((tiempoRestante % 60000) / 1000);

        return msg.reply(
          `⚠️ Ya generaste un partido hoy. Vuelve en *${horas}h ${minutos}m ${segundos}s*`
        );
      }

      const equipo1 = equipos[Math.floor(Math.random() * equipos.length)];

      let equipo2;

      do {
        equipo2 = equipos[Math.floor(Math.random() * equipos.length)];
      } while (equipo1 === equipo2);

      partidos.set(id, {
        equipo1,
        equipo2,
        marcador1: null,
        marcador2: null,
        equipoUsuario: null,
        chat: msg.chat
      });

      ultimoPartido.set(id, ahora);

      return msg.reply(
        `⚽ *¡Nuevo Partido para ${msg.pushName || 'Jugador'}!*\n\n` +
        `🥅 *Equipos:*\n*${equipo1} vs ${equipo2}*\n\n` +
        `🔹 Escribe: \`${usedPrefix}voto <tu equipo>\`\n` +
        `🔹 Ejemplo: \`${usedPrefix}voto ${equipo1}\`\n\n` +
        `💰 Apuesta: *${APUESTA.toLocaleString()} ${monedas}*`
      );
    }

    // Apostar por un equipo
    if (command === 'voto') {
      const partida = partidos.get(id);

      if (!partida) {
        return msg.reply('⚠️ No tienes un partido en curso. Usa `/partido` para iniciar uno.');
      }

      if (partida.chat !== msg.chat) {
        return msg.reply('⚠️ Debes realizar tu apuesta en el mismo grupo donde iniciaste el partido.');
      }

      if (partida.equipoUsuario) {
        return msg.reply('⚠️ Ya realizaste tu apuesta para este partido.');
      }

      if (!args.length) {
        return msg.reply('❌ Debes elegir un equipo. Ejemplo: `/voto <equipo>`');
      }

      const equipoSeleccionado = args.join(' ').trim();

      if (![partida.equipo1.toLowerCase(), partida.equipo2.toLowerCase()].includes(equipoSeleccionado.toLowerCase())) {
        return msg.reply(
          `⚠️ Elige un equipo válido:\n\n*${partida.equipo1}* o *${partida.equipo2}*`
        );
      }

      db.setCreate('chat_users', [msg.chat, id], 'coins', 0);

      const user = db.getChatUser(msg.chat, id);

      if (!user || (user.coins || 0) < APUESTA) {
        return msg.reply(
          `❌ No tienes suficientes ${monedas} para apostar.\nNecesitas al menos *${APUESTA.toLocaleString()} ${monedas}*.`
        );
      }

      user.coins = (user.coins || 0) - APUESTA;
      db.setChatUser(msg.chat, id, 'coins', user.coins);

      partida.equipoUsuario =
        partida.equipo1.toLowerCase() === equipoSeleccionado.toLowerCase()
          ? partida.equipo1
          : partida.equipo2;

      return msg.reply(
        `✅ Apostaste *${APUESTA.toLocaleString()} ${monedas}* y elegiste *${partida.equipoUsuario}*.\n\n` +
        `🔹 Ahora usa: \`${usedPrefix}marcador <goles de tu equipo> <goles del rival>\`\n` +
        `🔹 Ejemplo: \`${usedPrefix}marcador 3 1\``
      );
    }

    // Eliminar partido
    if (command === 'delp') {
      const partida = partidos.get(id);

      if (!partida) {
        return msg.reply('⚠️ No tienes un partido en curso para eliminar.');
      }

      if (partida.timer) {
        clearTimeout(partida.timer);
      }

      partidos.delete(id);

      return msg.reply(
        '⚠️ Tu partido ha sido eliminado. No podrás generar otro hasta mañana.'
      );
    }

    // Registrar marcador
    if (command === 'marcador') {
      const partida = partidos.get(id);

      if (!partida) {
        return msg.reply('⚠️ No tienes un partido en curso. Usa `/partido` para generar uno.');
      }

      if (partida.chat !== msg.chat) {
        return msg.reply('⚠️ Debes jugar en el mismo grupo donde iniciaste el partido.');
      }

      if (!partida.equipoUsuario) {
        return msg.reply('⚠️ Primero debes elegir tu equipo usando `/voto <equipo>`.');
      }

      if (partida.timer) {
        return msg.reply('⚠️ Ya registraste tu marcador. Espera el resultado oficial.');
      }

      if (
        args.length < 2 ||
        !/^\d+$/.test(args[0]) ||
        !/^\d+$/.test(args[1])
      ) {
        return msg.reply('❌ Debes escribir dos números. Ejemplo: `/marcador 2 1`');
      }

      const marcador1 = parseInt(args[0], 10);
      const marcador2 = parseInt(args[1], 10);

      if (marcador1 > 99 || marcador2 > 99) {
        return msg.reply('❌ El marcador máximo permitido es de 99 goles.');
      }

      partida.marcador1 = marcador1;
      partida.marcador2 = marcador2;

      const equipoRival =
        partida.equipoUsuario === partida.equipo1
          ? partida.equipo2
          : partida.equipo1;

      await msg.reply(
        `🕒 *Partido en curso...* 🏆\n\n` +
        `🔹 *${partida.equipo1} vs ${partida.equipo2}*\n\n` +
        `📢 *Resultado final en 5 minutos...*`
      );

      partida.timer = setTimeout(async () => {
        // Evita procesar un partido que ya fue eliminado.
        if (partidos.get(id) !== partida) return;

        const marcadorReal1 = Math.floor(Math.random() * 5);
        const marcadorReal2 = Math.floor(Math.random() * 5);

        // Normalizar la predicción según el orden oficial de los equipos.
        const prediccion1 =
          partida.equipoUsuario === partida.equipo1
            ? marcador1
            : marcador2;

        const prediccion2 =
          partida.equipoUsuario === partida.equipo1
            ? marcador2
            : marcador1;

        let mensajeResultado =
          `🏆 *Resultado Oficial:*\n` +
          `⚽ ${partida.equipo1} ${marcadorReal1} - ${marcadorReal2} ${partida.equipo2}\n\n` +
          `🔹 *Tu predicción:*\n` +
          `${partida.equipoUsuario} ${marcador1} - ${marcador2} ${equipoRival}`;

        let recompensa = 0;

        if (prediccion1 === marcadorReal1 && prediccion2 === marcadorReal2) {
          recompensa = PREMIO_EXACTO;

          mensajeResultado +=
            `\n\n🎉 ¡Increíble! Acertaste exactamente el marcador.\n` +
            `🎊 Ganaste *+${recompensa.toLocaleString()} ${monedas}*`;
        } else if (
          similarity(
            `${prediccion1}-${prediccion2}`,
            `${marcadorReal1}-${marcadorReal2}`
          ) >= umbralSimilitud
        ) {
          recompensa = PREMIO_CERCANO;

          mensajeResultado +=
            `\n\n👍 Estuviste cerca.\n` +
            `👏 Ganaste *+${recompensa.toLocaleString()} ${monedas}*`;
        } else {
          mensajeResultado +=
            `\n\n❌ No acertaste. Perdiste los *${APUESTA.toLocaleString()} ${monedas}* de tu apuesta.\n` +
            `¡Sigue intentando!`;
        }

        if (recompensa > 0) {
          db.setCreate('chat_users', [partida.chat, id], 'coins', 0);

          const user = db.getChatUser(partida.chat, id);

          user.coins = (user.coins || 0) + recompensa;

          db.setChatUser(partida.chat, id, 'coins', user.coins);
        }

        partidos.delete(id);

        try {
          await sock.sendMessage(
            partida.chat,
            { text: mensajeResultado },
            { quoted: msg }
          );
        } catch (error) {
          console.error('Error enviando resultado del partido:', error.message);
        }
      }, timeout);
    }
  }
};
