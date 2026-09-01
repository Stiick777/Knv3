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
      // API ALYACORE
      // =========================

      const api = `https://api.alyacore.xyz/dl/youtubeplay?query=${encodeURIComponent(text)}&key=LUFFY-FIX67`;

      const res = await fetch(api);
      const json = await res.json();

      if (
        !json.status ||
        !json.result ||
        !json.result.dl
      ) {
        throw new Error('La API no devolvió un enlace MP3 válido.');
      }

      const video = json.result;

      // =========================
      // DATOS DEL VIDEO
      // =========================

      const titulo = video.title || 'Sin título';
      const autor = video.channel || 'Desconocido';
      const duracionSegundos = Number(video.duration) || 0;
      const thumbnail = video.thumbnail;
      const mp3 = video.dl;
      const calidad = video.quality || 'Desconocida';
      const fileName = video.fileName || `${cleanFileName(titulo)}.mp3`;

      // =========================
      // DURACIÓN
      // =========================

      const duracion = secondString(duracionSegundos);

      // =========================
      // MENSAJE DE INFORMACIÓN
      // =========================

      const texto1 = `
𝚈𝚘𝚞𝚝𝚞𝚋𝚎 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊
===========================
> *𝚃𝚒𝚝𝚞𝚕𝚘* : ${titulo}
> *𝙲𝚊𝚗𝚊𝚕* : ${autor}
> *𝙳𝚞𝚛𝚊𝚌𝚒𝚘𝚗* : ${duracion}
> *𝙲𝚊𝚕𝚒𝚍𝚊𝚍* : ${calidad}

*🚀 Se está descargando el audio, espere...*
===========================
✰ KanBot ✰
> *Provided by AlyaCore*
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

      // Si HEAD no devuelve tamaño,
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
🎚️ *Calidad:* ${calidad}
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
            fileName: fileName,
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
            fileName: fileName,
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

  } catch {

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
// CONVERTIR SEGUNDOS A TIEMPO
// ========================================

function secondString(seconds) {

  seconds = Number(seconds);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const partes = [];

  if (d > 0) {
    partes.push(`${d} día${d !== 1 ? 's' : ''}`);
  }

  if (h > 0) {
    partes.push(`${h} hora${h !== 1 ? 's' : ''}`);
  }

  if (m > 0) {
    partes.push(`${m} minuto${m !== 1 ? 's' : ''}`);
  }

  if (s > 0 || partes.length === 0) {
    partes.push(`${s} segundo${s !== 1 ? 's' : ''}`);
  }

  return partes.join(', ');
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
