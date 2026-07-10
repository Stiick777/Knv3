
import fetch from 'node-fetch';
import yts from 'yt-search';



export default {
  command: ['play', 'play2'],
  category: 'downloads',
  description: '',
  run: async ({ msg, sock, command, args, text, usedPrefix }) => {

    // =========================================================
    // PLAY (AUDIO)
    // =========================================================
    if (command === 'play') {

      if (!text) {
        return msg.reply(`*𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚎𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝚕𝚘 𝚚𝚞𝚎 𝚚𝚞𝚒𝚎𝚛𝚎𝚜 𝚋𝚞𝚜𝚌𝚊𝚛*`);
      }

      await msg.react('🕓');

      // Buscar en YouTube
      const yt_play = await search(args.join(' '));

      // 🚨 Verificar duración antes de enviar mensaje o descargar
      const duracion = yt_play[0].duration.seconds || 0;

      if (duracion > 3600) {
        return msg.reply("❗ *El audio es superior a 1h*");
      }

      const texto1 = `
𝚈𝚘𝚞𝚝𝚞𝚋𝚎 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚜
===========================

> *𝚃𝚒𝚝𝚞𝚕𝚘* :  ${yt_play[0].title}

> *𝙲𝚛𝚎𝚊𝚍𝚘* :  ${yt_play[0].ago}

> *𝙳𝚞𝚛𝚊𝚌𝚒𝚘𝚗* :  ${secondString(yt_play[0].duration.seconds)}

*🚀 𝙎𝙀 𝙀𝙎𝙏𝘼 𝘿𝙀𝙎𝘼𝙍𝙂𝘼𝙉𝘿𝙊 𝙎𝙐 𝘼𝙐𝘿𝙄𝙊, 𝙀𝙎𝙋𝙀𝙍𝙀 𝙐𝙉 𝙈𝙊𝙈𝙀𝙉𝙏𝙊*

===========================
✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰
> *Provided by Stiiven*
`.trim();

      await sock.sendFile(
        msg.chat,
        yt_play[0].thumbnail,
        'error.jpg',
        texto1,
        msg,
        null
      );

      try {

        await msg.react('🕓');

        const url = yt_play[0].url;
        let title = 'audio';
        let downloadUrl = '';
        const mimetype = 'audio/mpeg';
        const fileExt = 'mp3';

        // ─────────────────────────────
        // 🥇 DELIRIUS API (PRINCIPAL)
        // ─────────────────────────────
        try {

          const resDel = await fetch(
            `https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(url)}`
          );

          const jsonDel = await resDel.json();

          if (jsonDel.status && jsonDel.data?.download) {
            title = jsonDel.data.title || title;
            downloadUrl = jsonDel.data.download;
          } else {
            throw new Error('Delirius 1 sin datos');
          }

        } catch (e1) {

          // ─────────────────────────────
          // 🔁 DELIRIUS V2 (RESPALDO)
          // ─────────────────────────────
          try {

            const resDel2 = await fetch(
              `https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(url)}`
            );

            const jsonDel2 = await resDel2.json();

            if (jsonDel2.success && jsonDel2.data?.download) {
              title = jsonDel2.data.title || title;
              downloadUrl = jsonDel2.data.download;
            } else {
              throw new Error('Delirius 2 sin datos');
            }

          } catch (e2) {

            // ─────────────────────────────
            // 🧯 ANABOT (ÚLTIMO RECURSO)
            // ─────────────────────────────
            const resAna = await fetch(
              'https://anabot.my.id/api/download/ytmp3',
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  url,
                  apikey: 'freeApikey'
                })
              }
            );

            const jsonAna = await resAna.json();

            if (
              jsonAna.success &&
              jsonAna.data?.result?.success &&
              jsonAna.data?.result?.urls
            ) {
              title = jsonAna.data.result.metadata.title || title;
              downloadUrl = jsonAna.data.result.urls;
            } else {
              throw new Error('Todas las APIs fallaron');
            }
          }
        }

        // ─────────────────────────────
        // 📤 ENVIAR AUDIO
        // ─────────────────────────────
        await sock.sendMessage(
          msg.chat,
          {
            audio: { url: downloadUrl },
            mimetype,
            fileName: `${title}.${fileExt}`,
            ptt: false
          },
          { quoted: msg }
        );

        await msg.react('✅');

      } catch (err) {

        await msg.react('❌');
        console.error(err);

        await sock.sendMessage(
          msg.chat,
          {
            text: '❌ Error al descargar el audio (todas las APIs fallaron)'
          },
          { quoted: msg }
        );
      }

    }

    // ====== CONTINÚA EN LA PARTE 2 (play2) ======
    // =========================================================
    // PLAY2 (VIDEO)
    // =========================================================
    if (command === 'play2') {

      if (!text) {
        return msg.reply(`*𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚎𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝚕𝚘 𝚚𝚞𝚎 𝚚𝚞𝚒𝚎𝚛𝚎𝚜 𝚋𝚞𝚜𝚌𝚊𝚛*`);
      }

      await msg.react('🕓');

      const yt_play = await search(args.join(' '));

      // Validación de duración
      const duracionSegundos = yt_play[0].duration.seconds || 0;

      if (duracionSegundos > 3600) {
        return msg.reply(
          `❌ *El video supera la duración máxima permitida de 1 hora.*\n\n📌 *Duración del video:* ${secondString(duracionSegundos)} Esto no es Amazon Prime Video`
        );
      }

      const texto1 = `
𝚈𝚘𝚞𝚝𝚞𝚋𝚎 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚜
===========================

> *𝚃𝚒𝚝𝚞𝚕𝚘* :  ${yt_play[0].title}

> *𝙲𝚛𝚎𝚊𝚍𝚘* :  ${yt_play[0].ago}

> *𝙳𝚞𝚛𝚊𝚌𝚒𝚘𝚗* :  ${secondString(duracionSegundos)}

*🚀 𝙎𝙀 𝙀𝙎𝙏𝘼 𝘿𝙀𝙎𝘼𝙍𝙂𝘼𝙉𝘿𝙊 𝙎𝙐 𝙑𝙄𝘿𝙀𝙊, 𝙀𝙎𝙋𝙀𝙍𝙀 𝙐𝙉 𝙈𝙊𝙈𝙀𝙉𝙏𝙊*

===========================
✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰
> *Provided by Stiiven*
`.trim();

      await sock.sendFile(
        msg.chat,
        yt_play[0].thumbnail,
        'error.jpg',
        texto1,
        msg,
        null
      );

      try {

        await msg.react('🕓');

        const url = yt_play[0].url;

        // ======================================================
        // ⚙️ FUNCIÓN PARA ENVIAR VIDEO SEGÚN TAMAÑO
        // ======================================================
        async function enviarVideo(chat, url, caption, thumbnail, quoted) {
          try {

            const head = await fetch(url, {
              method: 'HEAD'
            });

            const size = head.headers.get('content-length');
            const isLarge = size && Number(size) > 10 * 1024 * 1024;

            if (isLarge) {
              return sock.sendMessage(
                chat,
                {
                  document: { url },
                  mimetype: 'video/mp4',
                  fileName: 'video.mp4',
                  caption,
                  jpegThumbnail: thumbnail
                },
                { quoted }
              );
            }

            return sock.sendMessage(
              chat,
              {
                video: { url },
                caption,
                jpegThumbnail: thumbnail
              },
              { quoted }
            );

          } catch {

            return sock.sendMessage(
              chat,
              {
                video: { url },
                caption,
                jpegThumbnail: thumbnail
              },
              { quoted }
            );
          }
        }

        // ======================================================
// ⭐ API PRINCIPAL: FARE.INK
// ======================================================
try {

  const apiFare =
    `https://fare.ink/dl/ytv?url=${encodeURIComponent(url)}`;

  const resF = await fetch(apiFare, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  const jsonF = await resF.json();

  if (!jsonF.status || !jsonF.descarga?.url) {
    throw new Error('Fare inválida');
  }

  const thumb = jsonF.miniatura
    ? await (await fetch(jsonF.miniatura)).buffer()
    : null;

  await enviarVideo(
    msg.chat,
    jsonF.descarga.url,
    `🎬 *${jsonF.titulo}*

👤 Canal: ${jsonF.canal}
⏱️ Duración: ${jsonF.duracion}
👁️ Vistas: ${jsonF.vistas}
🎞️ Calidad: ${jsonF.descarga.calidad}
🌐 Servidor: Fare`,
    thumb,
    msg
  );

  await msg.react('✅');
  return;

} catch (e1) {
  console.warn('❌ Fare falló, usando respaldo StellarWA...');
}

// ======================================================
// 🔁 RESPALDO: STELLARWA
// ======================================================

const apiStellar =
  `https://api.stellarwa.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&key=proyectsV2`;

const resS = await fetch(apiStellar);
const jsonS = await resS.json();

if (!jsonS.status || !jsonS.result?.downloadUrl) {
  throw new Error('StellarWA inválida');
}

const thumb = jsonS.result.thumbnail
  ? await (await fetch(jsonS.result.thumbnail)).buffer()
  : null;

await enviarVideo(
  msg.chat,
  jsonS.result.downloadUrl,
  `🎬 *${jsonS.result.title}*

🎞️ Calidad: ${jsonS.result.format || "360p"}
🌐 Servidor: StellarWA`,
  thumb,
  msg
);

await msg.react('✅');

      } catch (e) {

        console.error(e);

        await msg.react('❌');

        await msg.reply(
          '⚠️ No se pudo descargar el video desde ningún servidor.'
        );
            }

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

function MilesNumber(number) {
  const exp = /(\d)(?=(\d{3})+(?!\d))/g;
  const rep = '$1.';
  const arr = number.toString().split('.');
  arr[0] = arr[0].replace(exp, rep);
  return arr[1] ? arr.join('.') : arr[0];
}

function secondString(seconds) {
  seconds = Number(seconds);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';

  return dDisplay + hDisplay + mDisplay + sDisplay;
}

const getBuffer = async (url) => {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer);
  } catch (error) {
    console.error("Error al obtener el buffer", error);
    throw new Error("Error al obtener el buffer");
  }
};

async function getFileSize(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD'
    });

    const contentLength = response.headers.get('content-length');

    return contentLength
      ? parseInt(contentLength, 10)
      : 0;

  } catch (error) {
    console.error("Error al obtener el tamaño del archivo", error);
    return 0;
  }
}

async function fetchY2mate(url) {
  const baseUrl = 'https://www.y2mate.com/mates/en60';

  const videoInfo = await fetch(`${baseUrl}/analyze/ajax`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      url,
      q_auto: 0
    })
  }).then(res => res.json());

  const id = videoInfo.result.id;

  const downloadInfo = await fetch(`${baseUrl}/convert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      type: 'youtube',
      _id: id,
      v_id: url,
      token: '',
      ftype: 'mp4',
      fquality: '360p'
    })
  }).then(res => res.json());

  return downloadInfo.result.url;
}

async function fetchInvidious(url) {
  const apiUrl = `https://invidious.io/api/v1/get_video_info`;

  const response = await fetch(
    `${apiUrl}?url=${encodeURIComponent(url)}`
  );

  const data = await response.json();

  if (data && data.video) {
    return data.video;
  }

  throw new Error(
    "No se pudo obtener información del video desde Invidious"
  );
}

async function fetch9Convert(url) {
  const apiUrl = `https://9convert.com/en429/api`;

  const response = await fetch(
    `${apiUrl}?url=${encodeURIComponent(url)}`
  );

  const data = await response.json();

  if (data.status === 'ok') {
    return data.result.mp3;
  }

  throw new Error(
    "No se pudo obtener la descarga desde 9Convert"
  );
    }
