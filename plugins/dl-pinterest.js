
import axios from "axios";
const {
  proto,
  generateWAMessageFromContent
} = (await import("@whiskeysockets/baileys")).default;

const handler = async (message, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(message.chat, `*💡 Uso Correcto:* ${usedPrefix + command} gatos`, message);
  }

  // Lista de palabras prohibidas
  const prohibited = [
    'se men', 'hen tai', 'se xo', 'te tas', 'cu lo', 'c ulo', 'cul o',
    'ntr', 'rule34', 'rule', 'caca', 'polla', 'femjoy', 'porno',
    'porn', 'gore', 'onlyfans', 'sofiaramirez01', 'kareli', 'karely',
    'cum', 'semen', 'nopor', 'puta', 'puto', 'culo', 'putita', 'putito',
    'pussy', 'hentai', 'pene', 'coño', 'asesinato', 'zoofilia',
    'mia khalifa', 'desnudo', 'desnuda', 'cuca', 'chocha', 'muertos',
    'pornhub', 'xnxx', 'xvideos', 'teta', 'vagina', 'marsha may',
    'misha cross', 'sexmex', 'furry', 'furro', 'furra', 'xxx',
    'rule34', 'panocha', 'pedofilia', 'necrofilia', 'pinga',
    'horny', 'ass', 'nude', 'popo', 'nsfw', 'femdom', 'futanari',
    'erofeet', 'sexo', 'sex', 'yuri', 'ero', 'ecchi', 'blowjob',
    'anal', 'ahegao', 'pija', 'verga', 'trasero', 'violation',
    'violacion', 'bdsm', 'cachonda', '+18', 'cp', 'mia marin',
    'lana rhoades', 'porn', 'cepesito', 'hot', 'buceta', 'xxx', 'nalga',
    'nalgas'
  ];

  const foundProhibitedWord = prohibited.find(word => text.toLowerCase().includes(word));
  if (foundProhibitedWord) {
    return conn.reply(message.chat, `⚠️ *No daré resultado a tu solicitud por pajin* - Palabra prohibida: ${foundProhibitedWord}`, message);
  }

  await conn.sendMessage(message.chat, {
    react: { text: "⌛", key: message.key }
  });

  try {
    const { data } = await axios.get(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`);

    if (!data.status || !data.data.length) {
      return conn.reply(message.chat, `❌ No encontré resultados para *${text}*`, message);
    }

    let results = [];
    let images = data.data.slice(0, 6);

    for (let img of images) {
      results.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({ text: null }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({ text: "⚡ 𝙺𝚊𝚗𝙱𝚘𝚝 ⚡" }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: img.grid_title || 'Imagen sin título',
          hasMediaAttachment: true,
          imageMessage: {
            url: img.images_url
          }
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ buttons: [] })
      });
    }

    const messageContent = generateWAMessageFromContent(message.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({ text: `🔎 RESULTADOS DE: ${text}` }),
            footer: proto.Message.InteractiveMessage.Footer.create({ text: "By ✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰" }),
            header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: false }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ cards: [...results] })
          })
        }
      }
    }, { quoted: message });

    await conn.relayMessage(message.chat, messageContent.message, { messageId: messageContent.key.id });
    await conn.sendMessage(message.chat, { react: { text: "✅", key: message.key } });

  } catch (error) {
    await conn.sendMessage(message.chat, { react: { text: "❌", key: message.key } });
    console.error(error);
    conn.reply(message.chat, `❌ *Error al buscar imágenes. Inténtalo de nuevo.*`, message);
  }
};

handler.help = ["pinterest <query>"];
handler.group = true;
handler.tags = ["dl"];
handler.command = ["pinterest", "pin", "pimg"];

export default handler;