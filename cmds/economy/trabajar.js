import db from '#db';

let cooldowns = {};

export default {
  command: ['w', 'work', 'chambear', 'chamba', 'trabajar'],
  category: 'rpg',
  description: '',
  run: async ({ msg }) => {
    db.setCreate('users', msg.sender, 'exp', 0);

    const user = db.getUser(msg.sender);
    const tiempo = 5 * 60;

    if (
      cooldowns[msg.sender] &&
      Date.now() - cooldowns[msg.sender] < tiempo * 1000
    ) {
      const tiempo2 = segundosAHMS(
        Math.ceil((cooldowns[msg.sender] + tiempo * 1000 - Date.now()) / 1000)
      );

      return msg.reply(
        `Espera ⏱️ *${tiempo2}* para volver a Trabajar.`
      );
    }

    const rsl = Math.floor(Math.random() * 5000);

    cooldowns[msg.sender] = Date.now();

    db.setUser(msg.sender, 'exp', (user.exp || 0) + rsl);

    await msg.reply(
      `⚡ ${pickRandom(trabajo)} *${toNum(rsl)}* ( *${rsl}* ) XP 🍭.`
    );
  },
};

function toNum(number) {
  if (number >= 1000 && number < 1000000) {
    return (number / 1000).toFixed(1) + 'k';
  } else if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else if (number <= -1000 && number > -1000000) {
    return (number / 1000).toFixed(1) + 'k';
  } else if (number <= -1000000) {
    return (number / 1000000).toFixed(1) + 'M';
  } else {
    return number.toString();
  }
}

function segundosAHMS(segundos) {
  const minutos = Math.floor((segundos % 3600) / 60);
  const segundosRestantes = segundos % 60;
  return `${minutos} minutos y ${segundosRestantes} segundos`;
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Thanks to FG98
const trabajo = [
  "Trabajas como cortador de galletas y ganas",
  "Trabaja para una empresa militar privada, ganando",
  "Organiza un evento de cata de vinos y obtienes",
  "Limpias la chimenea y encuentras",
  "Desarrollas juegos para ganarte la vida y ganas",
  "Trabajaste en la oficina horas extras por",
  "Trabajas como secuestrador de novias y ganas",
  "Alguien vino y representó una obra de teatro. Por mirar te dieron",
  "Compraste y vendiste artículos y ganaste",
  "Trabajas en el restaurante de la abuela como cocinera y ganas",
  "Trabajas 10 minutos en un Pizza Hut local. Ganaste",
  "Trabajas como escritor(a) de galletas de la fortuna y ganas",
  "Revisas tu bolso y decides vender algunos artículos inútiles que no necesitas. Resulta que toda esa basura valía",
  "Desarrollas juegos para ganarte la vida y ganas",
  "Trabajas todo el día en la empresa por",
  "Diseñaste un logo para una empresa por",
  "¡Trabajó lo mejor que pudo en una imprenta que estaba contratando y ganó su bien merecido!",
  "Trabajas como podador de arbustos y ganas",
  "Trabajas como actor de voz para Bob Esponja y te las arreglaste para ganar",
  "Estabas cultivando y Ganaste",
  "Trabajas como constructor de castillos de arena y ganas",
  "Trabajas como artista callejera y ganas",
  "¡Hiciste trabajo social por una buena causa! por tu buena causa Recibiste",
  "Reparaste un tanque T-60 averiado en Afganistán. La tripulación te pagó",
  "Trabajas como ecologista de anguilas y ganas",
  "Trabajas en Disneyland como un panda disfrazado y ganas",
  "Reparas las máquinas recreativas y recibes",
  "Hiciste algunos trabajos ocasionales en la ciudad y ganaste",
  "Limpias un poco de moho tóxico de la ventilación y ganas",
  "Resolviste el misterio del brote de cólera y el gobierno te recompensó con una suma de",
  "Trabajas como zoólogo y ganas",
  "Vendiste sándwiches de pescado y obtuviste",
  "Reparas las máquinas recreativas y recibes",
];
