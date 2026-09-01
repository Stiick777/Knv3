import fetch from "node-fetch";
import axios from "axios";

export default {
  command: ['playv1'],
  category: 'downloads',
  description: '',
  run: async ({ msg, sock, text, command, args }) => {

    if (command !== 'playv1') return;

    if (!text) {
      return msg.reply(`*Ingresa el nombre de lo que quieres buscar*`);
    }

    await msg.react('🕓');

    try {

      // =========================
      // BUSCAR EN YOSOYYO
      // =========================

      const api = `https://yosoyyo-api-ofc.onrender.com/api/youtube?q=${encodeURIComponent(text)}&apiKey=yosoyyo_sk_vdri1g4p`;

      const res = await fetch(api);
      const json = await res.json();

      if (
        json.status !== 200 ||
        !Array.isArray(json.result) ||
        !json.result[0]
      ) {
        throw new Error('No se encontraron resultados.');
      }

      // Primer resultado
      const video = json.result[0];

      // =========================
      // COMPROBAR MP3
      // =========================

      const mp3 = video.download?.mp3;

      if (!mp3) {
        throw new Error('La API no devolvió un enlace MP3 válido.');
      }

      // =========================
      // DATOS DEL VIDEO
      // =========================

      const titulo = video.title || 'Sin título';
      const autor = video.channelName || 'Desconocido';
      const duracion = video.duration || 'Desconocida';
      const thumbnail = video.thumbnailUrl;
      const videoUrl = video.videoUrl || '';

      // =========================
      // MENSAJE DE INFORMACIÓN
      // =========================

      const texto1 = `
𝚈𝚘𝚞𝚝𝚞𝚋𝚎 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊
===========================
> *𝚃𝚒𝚝𝚞𝚕𝚘* : ${titulo}
> *𝙰𝚞𝚝𝚘𝚛* : ${autor}
> *𝙳𝚞𝚛𝚊𝚌𝚒𝚘𝚗* : ${duracion}
> *𝚄𝚁𝙻* : ${videoUrl}

*🚀 Se está descargando el audio, espere...*
===========================
✰ KanBot ✰
> *Provided by YOSOYYO*
`.trim();

      // =========================
      // ENVIAR MINIATURA
      // =========================

      if (thumbnail) {

        await sock.sendMessage(
          msg.chat,
          {
            image: { url: thumbnail },
            caption: texto1
          },
          {
            quoted: msg
          }
        );

      } else {

        await msg.reply(texto1);

      }

      // =========================
      // OBTENER TAMAÑO
      // =========================

      let size = await getSize(mp3);

      // =========================
      // DESCARGAR MP3
      // =========================

      const audioRes = await fetch(mp3);

      if (!audioRes.ok) {
        throw new Error(
          `No se pudo descargar el audio. Código HTTP: ${audioRes.status}`
        );
      }

      const buffer = await audioRes.buffer();

      // Si HEAD no devolvió tamaño,
      // usamos el tamaño real del buffer.
      if (!size && buffer?.length) {
        size = buffer.length;
      }

      // =========================
      // LÍMITE DE 10 MB
      // =========================

      const SIZE_LIMIT = 10 * 1024 * 1024;

      // =========================
      // INFORMACIÓN DEL AUDIO
      // =========================

      const cap = `😎 Su audio by *_KanBot_*:

🎵 *Título:* ${titulo}
👤 *Autor:* ${autor}
⏱️ *Duración:* ${duracion}
📦 *Peso:* ${formatSize(size)}
`;

      // =========================
      // ENVIAR AUDIO
      // =========================

      if (size > SIZE_LIMIT) {

        // -------------------------
        // MÁS DE 10 MB → DOCUMENTO
        // -------------------------

        await sock.sendMessage(
          msg.chat,
          {
            document: buffer,
            mimetype: 'audio/mpeg',
            fileName: `${cleanFileName(titulo)}.mp3`,
            caption: cap
          },
          {
            quoted: msg
          }
        );

      } else {

        // -------------------------
        // 10 MB O MENOS → AUDIO
        // -------------------------

        await sock.sendMessage(
          msg.chat,
          {
            audio: buffer,
            mimetype: 'audio/mpeg',
            fileName: `${cleanFileName(titulo)}.mp3`,
            ptt: false
          },
          {
            quoted: msg
          }
        );

      }

      // =========================
      // ÉXITO
      // =========================

      await msg.react('✅');

    } catch (error) {

      console.error('Error en playv1:', error);

      await msg.react('❌');

      await msg.reply(
        `❌ *Ocurrió un error al intentar descargar el audio.*\n\n📄 *Razón:* ${error.message}`
      );

    }

  },
};


// ========================================
// OBTENER TAMAÑO DEL ARCHIVO
// ========================================

async function getSize(url) {

  try {

    const response = await axios.head(url);

    const contentLength = response.headers['content-length'];

    return contentLength
      ? parseInt(contentLength, 10)
      : null;

  } catch (error) {

    return null;

  }

}


// ========================================
// FORMATEAR TAMAÑO
// ========================================

function formatSize(bytes) {

  const units = ['B', 'KB', 'MB', 'GB'];

  let i = 0;

  bytes = Number(bytes);

  if (!bytes || isNaN(bytes)) {
    return 'Desconocido';
  }

  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }

  return `${bytes.toFixed(2)} ${units[i]}`;

}


// ========================================
// LIMPIAR NOMBRE DEL ARCHIVO
// ========================================

function cleanFileName(name) {

  return String(name)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .trim()
    .slice(0, 150) || 'audio';

}
