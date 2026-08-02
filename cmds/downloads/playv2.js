import fetch from "node-fetch";
import axios from "axios";
import yts from "yt-search";

export default {
  command: ['playv2'],
  category: 'downloads',
  description: '',
  run: async ({ msg, sock, text, command, args }) => {

    if (command !== 'playv2') return;

    if (!text) {
      return msg.reply(`*Ingresa el nombre de lo que quieres buscar*`);
    }

    await msg.react('🕓');

    const yt_play = await search(args.join(' '));

    if (!yt_play || !yt_play[0]) {
      return msg.reply('❌ No se encontraron resultados.');
    }

    const duracionSegundos = yt_play[0].duration.seconds || 0;

    if (duracionSegundos > 3600) {
      return msg.reply(
        `❌ *El video supera la duración máxima permitida de 1 hora.*\n\n📌 *Duración:* ${secondString(duracionSegundos)}`
      );
    }

    const texto1 = `
𝚈𝚘𝚞𝚝𝚞𝚋𝚎 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊
===========================
> *𝚃𝚒𝚝𝚞𝚕𝚘* : ${yt_play[0].title}
> *𝙲𝚛𝚎𝚊𝚍𝚘* : ${yt_play[0].ago}
> *𝙳𝚞𝚛𝚊𝚌𝚒𝚘𝚗* : ${secondString(duracionSegundos)}
*🚀 Se está descargando el video, espere...*
===========================
✰ KanBot ✰
> *Provided by Stiiven*
`.trim();

    await sock.sendMessage(
      msg.chat,
      {
        image: { url: yt_play[0].thumbnail },
        caption: texto1
      },
      {
        quoted: msg
      }
    );

    try {

      const api = `https://api.alyacore.xyz/dl/youtubeplayv2?query=${encodeURIComponent(text)}&type=mp4&quality=auto&key=LUFFY-FIX67`;

      const res = await fetch(api);
      const json = await res.json();

      if (!json.status || !json.data?.dl) {
        throw new Error("La API no devolvió un enlace válido.");
      }

      const video = json.data.dl;

      let size = await getSize(video);

      if (!size && json.data.size) {
        size = Number(json.data.size);
      }

      const MAX_SIZE = 104857600; // 100 MB

      const cap = `😎 Su video by *_KanBot_*:

🎬 *Título:* ${json.data.title}
👤 *Autor:* ${json.data.author}
⏱️ *Duración:* ${json.data.duration}
🎥 *Calidad:* ${json.data.quality}
📦 *Peso:* ${await formatSize(size) || "Desconocido"}
`;

      const buffer = await (await fetch(video)).buffer();

      if (size && size > MAX_SIZE) {

        await sock.sendMessage(
          msg.chat,
          {
            document: buffer,
            mimetype: 'video/mp4',
            fileName: json.data.fileName || `${json.data.title}.mp4`,
            caption: cap
          },
          {
            quoted: msg
          }
        );

      } else {

        await sock.sendMessage(
          msg.chat,
          {
            video: buffer,
            mimetype: 'video/mp4',
            fileName: json.data.fileName || `${json.data.title}.mp4`,
            caption: cap
          },
          {
            quoted: msg
          }
        );

      }

      await msg.react('✅');

    } catch (error) {

      console.error(error);

      await msg.react('❌');

      await msg.reply(
        `❌ *Ocurrió un error al intentar enviar el video.*\n\n📄 *Razón:* ${error.message}`
      );

    }

  },
};

async function search(query, options = {}) {
  const search = await yts.search({
    query,
    hl: 'es',
    gl: 'ES',
    ...options
  });

  return search.videos;
}

function secondString(seconds) {
  seconds = Number(seconds);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + ' día, ' : '';
  const hDisplay = h > 0 ? h + ' hora, ' : '';
  const mDisplay = m > 0 ? m + ' minuto, ' : '';
  const sDisplay = s > 0 ? s + ' segundos' : '';

  return dDisplay + hDisplay + mDisplay + sDisplay;
}

async function formatSize(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;

  bytes = Number(bytes);

  if (isNaN(bytes)) return "Desconocido";

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }

  return `${bytes.toFixed(2)} ${units[i]}`;
}

async function getSize(url) {
  try {
    const response = await axios.head(url);

    const contentLength = response.headers['content-length'];

    return contentLength
      ? parseInt(contentLength, 10)
      : null;

  } catch {
    return null;
  }
}
