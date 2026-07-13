import fetch from 'node-fetch';
import yts from 'yt-search';

export default {
  command: ['play2'],
  category: 'downloads',
  description: 'Descarga video de YouTube',

  run: async ({ msg, sock, args, text }) => {

    if (!text) {
      return msg.reply(`*𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚎𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝚕𝚘 𝚚𝚞𝚎 𝚚𝚞𝚒𝚎𝚛𝚎𝚜 𝚋𝚞𝚜𝚌𝚊𝚛*`);
    }

    await msg.react('🕓');

    // Buscar video
    const yt_play = await search(args.join(' '));

    if (!yt_play.length) {
      return msg.reply('❌ No se encontraron resultados.');
    }

    // Validar duración
    const duracionSegundos = yt_play[0].duration.seconds || 0;

    if (duracionSegundos > 3600) {
      return msg.reply(
        `❌ *El video supera la duración máxima permitida de 1 hora.*\n\n📌 *Duración:* ${secondString(duracionSegundos)}`
      );
    }

    const texto1 = `
𝚈𝚘𝚞𝚝𝚞𝚋𝚎 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚜

> 𝚃𝚒𝚝𝚞𝚕𝚘 : ${yt_play[0].title}
> 𝙲𝚛𝚎𝚊𝚍𝚘 : ${yt_play[0].ago}
> 𝙳𝚞𝚛𝚊𝚌𝚒𝚘𝚗 : ${secondString(duracionSegundos)}

🚀 𝙎𝙀 𝙀𝙎𝙏𝘼 𝘿𝙀𝙎𝘾𝘼𝙍𝙂𝘼𝙉𝘿𝙊 𝙎𝙐 𝙑𝙄𝘿𝙀𝙊, 𝙀𝙎𝙋𝙀𝙍𝙀 𝙐𝙉 𝙈𝙊𝙈𝙀𝙉𝙏𝙊

===========================
✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰
> Provided by Stiiven
`.trim();

    await sock.sendFile(
      msg.chat,
      yt_play[0].thumbnail,
      'thumbnail.jpg',
      texto1,
      msg
    );

    try {

      await msg.react('🕓');

      const url = yt_play[0].url;

      // ==========================================
      // ENVIAR VIDEO SEGÚN SU TAMAÑO
      // ==========================================
      async function enviarVideo(chat, videoUrl, caption, thumbnail, quoted) {

        try {

          const head = await fetch(videoUrl, {
            method: 'HEAD'
          });

          const size = Number(head.headers.get('content-length') || 0);

          if (size > 10 * 1024 * 1024) {

            return await sock.sendMessage(chat, {
              document: {
                url: videoUrl
              },
              mimetype: 'video/mp4',
              fileName: 'video.mp4',
              jpegThumbnail: thumbnail,
              caption
            }, {
              quoted
            });

          }

          return await sock.sendMessage(chat, {
            video: {
              url: videoUrl
            },
            jpegThumbnail: thumbnail,
            caption
          }, {
            quoted
          });

        } catch (err) {

          return await sock.sendMessage(chat, {
            video: {
              url: videoUrl
            },
            jpegThumbnail: thumbnail,
            caption
          }, {
            quoted
          });

        }

      }

      // =====================================================
      // AQUÍ COMIENZA EL BLOQUE DE APIs
      // (ApiCausas -> StellarWA -> Fare)
      // =====================================================
          // =====================================================
      // ⭐ API PRINCIPAL: APICAUSAS
      // =====================================================
      try {

        const apiCausas =
          `https://rest.apicausas.xyz/api/v1/descargas/youtube?apikey=causa-ee5ee31dcfc79da4&url=${encodeURIComponent(url)}&type=video&quality=420`;

        const resC = await fetch(apiCausas);
        const jsonC = await resC.json();

        if (!jsonC.status || !jsonC.data || !jsonC.data.download || !jsonC.data.download.url) {
          throw new Error('ApiCausas inválida');
        }

        const thumb = jsonC.data.thumbnail
          ? await (await fetch(jsonC.data.thumbnail)).buffer()
          : null;

        await enviarVideo(
          msg.chat,
          jsonC.data.download.url,
          `🎬 ${jsonC.data.title}
👤 Canal: ${jsonC.data.uploader}
⏱️ Duración: ${secondString(jsonC.data.duration)}
🎞️ Calidad: ${jsonC.data.quality_tag}
🌐 Servidor: ApiCausas`,
          thumb,
          msg
        );

        await msg.react('✅');
        return;

      } catch (e1) {
        console.warn('❌ ApiCausas falló, usando StellarWA...');
      }

      // =====================================================
      // ⭐ RESPALDO 1: STELLARWA
      // =====================================================
      try {

        const apiStellar =
          `https://api.stellarwa.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&key=proyectsV2`;

        const resS = await fetch(apiStellar);
        const jsonS = await resS.json();

        if (!jsonS.status || !jsonS.result || !jsonS.result.downloadUrl) {
          throw new Error('StellarWA inválida');
        }

        const thumb = jsonS.result.thumbnail
          ? await (await fetch(jsonS.result.thumbnail)).buffer()
          : null;

        await enviarVideo(
          msg.chat,
          jsonS.result.downloadUrl,
          `🎬 ${jsonS.result.title}
🎞️ Calidad: ${jsonS.result.format || '360p'}
🌐 Servidor: StellarWA`,
          thumb,
          msg
        );

        await msg.react('✅');
        return;

      } catch (e2) {
        console.warn('❌ StellarWA falló, usando Fare...');
      }

      // =====================================================
      // ⭐ RESPALDO 2: FARE.INK
      // =====================================================
      try {

        const apiFare =
          `https://fare.ink/dl/ytv?url=${encodeURIComponent(url)}&apikey=kanbot`;

        const resF = await fetch(apiFare, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const jsonF = await resF.json();

        if (!jsonF.status || !jsonF.descarga || !jsonF.descarga.url) {
          throw new Error('Fare inválida');
        }

        const thumb = jsonF.miniatura
          ? await (await fetch(jsonF.miniatura)).buffer()
          : null;

        await enviarVideo(
          msg.chat,
          jsonF.descarga.url,
          `🎬 ${jsonF.titulo}
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

      } catch (e3) {
        throw new Error('Todas las APIs fallaron');
      }

    } catch (err) {

      console.error(err);

      await msg.react('❌');

      await sock.sendMessage(
        msg.chat,
        {
          text: '⚠️ No se pudo descargar el video desde ningún servidor.'
        },
        {
          quoted: msg
        }
      );

    }

  }

};

// 📌 Funciones compartidas

async function search(query, options = {}) {
  const result = await yts.search({
    query,
    hl: 'es',
    gl: 'ES',
    ...options
  });

  return result.videos;
}

function secondString(seconds) {

  seconds = Number(seconds);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d === 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h === 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m === 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s === 1 ? ' segundo' : ' segundos') : '';

  return dDisplay + hDisplay + mDisplay + sDisplay;

}
