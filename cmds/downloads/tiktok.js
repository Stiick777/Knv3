import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt', 'ttdl', 'tiktokdl'],
  category: 'downloads',
  description: '',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    if (!args[0]) {
      await msg.react('❌');
      return msg.reply(
        `*☁️ Ingrese un enlace de TikTok.*\n\n*💌 Ejemplo:* _${usedPrefix + command} https://vt.tiktok.com/xxxxx/_`
      );
    }

    if (!/(?:https?:\/\/)?(?:www|vm|vt|tiktok)\.com\/[^\s]+/gi.test(args[0])) {
      await msg.react('❌');
      return msg.reply('*☁️ Enlace de TikTok inválido.*');
    }

    try {
      await msg.react('🕒');

      const api = `https://api.yupra.my.id/api/downloader/tiktok?url=${encodeURIComponent(args[0])}`;
      const res = await fetch(api);

      if (!res.ok) throw new Error('API no respondió');

      const json = await res.json();

      if (json.status !== 200 || !json.result) {
        throw new Error('Respuesta inválida');
      }

      const r = json.result;

      const caption = `
*👤 Autor:* ${r.author?.nickname || r.author?.username || 'Desconocido'}
*📝 Título:* ${r.title || 'Sin título'}
*❤️ Likes:* ${r.like || 0}
*👁 Views:* ${r.views || 0}
*🔁 Shares:* ${r.share || 0}
*💬 Comentarios:* ${r.comment || 0}

📥 *Descargado por KanBot*
`.trim();

      await msg.react('📤');

      //=========================
      // 🎥 VIDEO
      //=========================
      if (r.isVideo && r.download) {

        await sock.sendMessage(
          msg.chat,
          {
            video: { url: r.download },
            caption
          },
          { quoted: msg }
        );

        // 🎵 Audio
        if (r.music?.url) {
          try {
            await sock.sendMessage(
              msg.chat,
              {
                audio: { url: r.music.url },
                mimetype: 'audio/mpeg',
                ptt: false
              },
              { quoted: msg }
            );
          } catch (e) {
            console.log('Audio no enviado:', e.message);
          }
        }

        await msg.react('✅');
        return;
      }

      //=========================
      // 🖼 IMÁGENES / SLIDES
      //=========================
      if (!r.isVideo && Array.isArray(r.download)) {

        for (let i = 0; i < r.download.length; i++) {
          await sock.sendMessage(
            msg.chat,
            {
              image: { url: r.download[i] },
              caption: i === 0 ? caption : undefined
            },
            { quoted: msg }
          );
        }

        // 🎵 Audio del slideshow
        if (r.music?.url) {
          try {
            await sock.sendMessage(
              msg.chat,
              {
                audio: { url: r.music.url },
                mimetype: 'audio/mpeg',
                ptt: false
              },
              { quoted: msg }
            );
          } catch (e) {
            console.log('Audio no enviado:', e.message);
          }
        }

        await msg.react('✅');
        return;
      }

      throw new Error('No se encontró contenido');

    } catch (err) {
      console.error('❌ TikTok Error:', err);
      await msg.react('❌');

      return msg.reply(
        '*🌟 Error al procesar el TikTok, intenta más tarde.*'
      );
    }
  },
};
