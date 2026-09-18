import fetch from 'node-fetch';
import yts from 'yt-search';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';

export default {
  command: ['play2'],
  category: 'downloads',
  description: 'Descarga video de YouTube',

  run: async ({ msg, sock, args, text }) => {

    if (!text) {
      return msg.reply(`*𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚎𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝚕𝚘 𝚚𝚞𝚒𝚎𝚛𝚎𝚜 𝚋𝚞𝚜𝚌𝚊𝚛*`);
    }

    await msg.react('🕓');

    try {

      // ==========================================
      // 🔎 BUSCAR EN YOUTUBE
      // ==========================================

      const yt_play = await search(args.join(' '));

      if (!yt_play.length) {
        await msg.react('❌');
        return msg.reply('❌ No se encontraron resultados.');
      }

      const duracionSegundos = yt_play[0].duration?.seconds || 0;

      if (duracionSegundos > 3600) {
        await msg.react('❌');

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

      // ==========================================
      // 🖼️ MINIATURA
      // ==========================================

      await sock.sendFile(
        msg.chat,
        yt_play[0].thumbnail,
        'thumbnail.jpg',
        texto1,
        msg
      );

      const url = yt_play[0].url;

      // ==========================================
      // 📁 CARPETA TEMPORAL
      // ==========================================

      const tempDir = path.join(os.tmpdir(), 'kanbot');

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // ==========================================
      // 🎬 DESCARGAR VIDEO A DISCO
      // ==========================================

      async function descargarVideo(videoUrl) {

        const res = await fetch(videoUrl);

        if (!res.ok) {
          throw new Error(`Error descargando video: ${res.status}`);
        }

        const extension = '.mp4';

        const fileName =
          `kanbot-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;

        const filePath = path.join(tempDir, fileName);

        const fileStream = fs.createWriteStream(filePath);

        return await new Promise((resolve, reject) => {

          let terminado = false;

          const limpiar = () => {
            fileStream.removeListener('error', onError);
            fileStream.removeListener('finish', onFinish);
          };

          const onError = (err) => {
            if (terminado) return;

            terminado = true;
            limpiar();

            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch {}

            reject(err);
          };

          const onFinish = () => {
            if (terminado) return;

            terminado = true;
            limpiar();

            resolve(filePath);
          };

          fileStream.once('error', onError);
          fileStream.once('finish', onFinish);

          res.body.pipe(fileStream);
        });
      }

      // ==========================================
      // 📤 ENVIAR VIDEO
      // ==========================================

      async function enviarVideo(
        chat,
        videoUrl,
        caption,
        thumbnail,
        quoted
      ) {

        let filePath = null;

        try {

          filePath = await descargarVideo(videoUrl);

          const stats = fs.statSync(filePath);

          // ========================================
          // 📦 MÁS DE 10 MB → DOCUMENTO
          // ========================================

          if (stats.size > 10 * 1024 * 1024) {

            return await sock.sendMessage(
              chat,
              {
                document: {
                  url: filePath
                },
                mimetype: 'video/mp4',
                fileName: 'video.mp4',
                jpegThumbnail: thumbnail,
                caption
              },
              {
                quoted
              }
            );
          }

          // ========================================
          // 🎬 MENOS DE 10 MB → VIDEO
          // ========================================

          return await sock.sendMessage(
            chat,
            {
              video: {
                url: filePath
              },
              mimetype: 'video/mp4',
              jpegThumbnail: thumbnail,
              caption
            },
            {
              quoted
            }
          );

        } finally {

          // ========================================
          // 🗑️ ELIMINAR ARCHIVO TEMPORAL
          // ========================================

          if (filePath) {

            setTimeout(() => {

              try {

                if (fs.existsSync(filePath)) {
                  fs.unlinkSync(filePath);
                }

              } catch {}

            }, 10000);

          }

        }
      }

      // ==========================================
      // ⭐ API PRINCIPAL: FAA
      // ==========================================

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

        const thumbRes = await fetch(yt_play[0].thumbnail);

        if (!thumbRes.ok) {
          throw new Error('No se pudo descargar la miniatura');
        }

        const thumb = Buffer.from(
          await thumbRes.arrayBuffer()
        );

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

      // ==========================================
      // ⭐ RESPALDO 1: YUKI
      // ==========================================

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

        let thumb;

        if (json.data?.thumbnail) {

          const thumbRes = await fetch(json.data.thumbnail);

          if (!thumbRes.ok) {
            throw new Error('Error descargando thumbnail');
          }

          thumb = Buffer.from(
            await thumbRes.arrayBuffer()
          );

        } else {

          const thumbRes = await fetch(yt_play[0].thumbnail);

          if (!thumbRes.ok) {
            throw new Error('Error descargando thumbnail');
          }

          thumb = Buffer.from(
            await thumbRes.arrayBuffer()
          );
        }

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

      // ==========================================
      // ⭐ RESPALDO 2: ALYACORE
      // ==========================================

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

        const thumbRes = await fetch(yt_play[0].thumbnail);

        if (!thumbRes.ok) {
          throw new Error('No se pudo descargar la miniatura');
        }

        const thumb = Buffer.from(
          await thumbRes.arrayBuffer()
        );

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


// ==========================================
// 🔎 BUSCAR EN YOUTUBE
// ==========================================

async function search(query, options = {}) {

  const result = await yts.search({
    query,
    hl: 'es',
    gl: 'ES',
    ...options
  });

  return result.videos;
}


// ==========================================
// ⏱️ DURACIÓN
// ==========================================

function secondString(seconds) {

  seconds = Number(seconds);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay =
    d > 0
      ? d + (d === 1 ? ' día, ' : ' días, ')
      : '';

  const hDisplay =
    h > 0
      ? h + (h === 1 ? ' hora, ' : ' horas, ')
      : '';

  const mDisplay =
    m > 0
      ? m + (m === 1 ? ' minuto, ' : ' minutos, ')
      : '';

  const sDisplay =
    s > 0
      ? s + (s === 1 ? ' segundo' : ' segundos')
      : '';

  return dDisplay + hDisplay + mDisplay + sDisplay;
      }
