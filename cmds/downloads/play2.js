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
      // ⭐ API PRINCIPAL: FAA
      // =====================================================
      try {

        const api =
          `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(url)}`;

        const res = await fetch(api);
        const json = await res.json();

        if (
          !json.status ||
          !json.result ||
          !json.result.download_url
        ) {
          throw new Error('FAA inválida');
        }

        const thumb = await (await fetch(yt_play[0].thumbnail)).buffer();

        await enviarVideo(
          msg.chat,
          json.result.download_url,
          `🎬 ${yt_play[0].title}
⏱️ Duración: ${secondString(duracionSegundos)}
🎞️ Formato: ${json.result.format}
🌐 Servidor: FAA`,
          thumb,
          msg
        );

        await msg.react('✅');
        return;

      } catch (e1) {
        console.warn('❌ FAA falló, usando Yuki...');
      }

      // =====================================================
      // ⭐ RESPALDO 1: YUKI-WABOT
      // =====================================================
      try {

        const api =
          `https://api.yuki-wabot.my.id/dl/ytmp4v2?url=${encodeURIComponent(url)}&key=YukiBot-MD`;

        const res = await fetch(api);
        const json = await res.json();

        if (
          !json.status ||
          !json.download ||
          !json.download.url
        ) {
          throw new Error('Yuki inválida');
        }

        const thumb = json.data?.thumbnail
          ? await (await fetch(json.data.thumbnail)).buffer()
          : await (await fetch(yt_play[0].thumbnail)).buffer();

        await enviarVideo(
          msg.chat,
          json.download.url,
          `🎬 ${json.data.title}
⏱️ Duración: ${json.data.duration}
👁️ Vistas: ${json.data.views}
🎞️ Calidad: ${json.download.quality}p
🌐 Servidor: Yuki`,
          thumb,
          msg
        );

        await msg.react('✅');
        return;

      } catch (e2) {
        console.warn('❌ Yuki falló, usando AlyaCore...');
      }

      // =====================================================
      // ⭐ RESPALDO 2: ALYACORE
      // =====================================================
      try {

        const api =
          `https://api.alyacore.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&quality=auto&key=LUFFY-FIX67`;

        const res = await fetch(api);
        const json = await res.json();

        if (
          !json.status ||
          !json.data ||
          !json.data.dl
        ) {
          throw new Error('AlyaCore inválida');
        }

        const thumb = await (await fetch(yt_play[0].thumbnail)).buffer();

        await enviarVideo(
          msg.chat,
          json.data.dl,
          `🎬 ${json.data.title}
⏱️ Duración: ${secondString(duracionSegundos)}
🎞️ Calidad: ${json.data.quality}
🌐 Servidor: AlyaCore`,
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
