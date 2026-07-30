import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt', 'ttdl', 'tiktokdl'],
  category: 'downloads',
  description: 'Descarga videos e imágenes de TikTok',
  run: async ({ msg, sock, args, usedPrefix, command }) => {
    if (!args[0]) {
      await msg.react('❌');
      return msg.reply(
        `*☁️ Ingresa un enlace de TikTok.*\n\n*💌 Ejemplo:* _${usedPrefix + command} https://vt.tiktok.com/xxxxx/_`
      );
    }

    if (!/(?:https?:\/\/)?(?:www|vm|vt|tiktok)\.com\/[^\s]+/i.test(args[0])) {
      await msg.react('❌');
      return msg.reply('*☁️ Enlace de TikTok inválido.*');
    }

    try {
      await msg.react('🕒');

      const api = `https://api.dorratz.com/v1/tiktok?url=${encodeURIComponent(args[0])}`;
      const res = await fetch(api);

      if (!res.ok) throw new Error('La API no respondió');

      const json = await res.json();

      if (!json.ok || !json.data?.status || !json.data?.data) {
        throw new Error('Respuesta inválida de la API');
      }

      const r = json.data.data;

      const caption = `
*👤 Autor:* ${r.author?.nickname || 'Desconocido'}
*📛 Usuario:* ${r.author?.username || '-'}
*📝 Título:* ${r.title || 'Sin título'}

*❤️ Likes:* ${Number(r.like || 0).toLocaleString()}
*👁️ Vistas:* ${Number(r.repro || 0).toLocaleString()}
*💬 Comentarios:* ${Number(r.comment || 0).toLocaleString()}
*🔁 Compartidos:* ${Number(r.share || 0).toLocaleString()}

📥 *Descargado por KanBot*
`.trim();

      await msg.react('📤');

      //=========================
      // 🎥 VIDEO
      //=========================
      if (r.media?.type === 'video') {

        const video =
          r.media.hd ||
          r.media.org ||
          r.media.wm;

        await sock.sendMessage(
          msg.chat,
          {
            video: { url: video },
            caption
          },
          { quoted: msg }
        );

        if (r.media.music) {
          try {
            await sock.sendMessage(
              msg.chat,
              {
                audio: { url: r.media.music },
                mimetype: 'audio/mpeg',
                ptt: false
              },
              { quoted: msg }
            );
          } catch (e) {
            console.log('Error enviando audio:', e.message);
          }
        }

        await msg.react('✅');
        return;
      }

      //=========================
      // 🖼️ SLIDES / IMÁGENES
      //=========================
      if (
        r.media?.type === 'image' &&
        Array.isArray(r.media.images)
      ) {

        for (let i = 0; i < r.media.images.length; i++) {
          await sock.sendMessage(
            msg.chat,
            {
              image: { url: r.media.images[i] },
              caption: i === 0 ? caption : undefined
            },
            { quoted: msg }
          );
        }

        if (r.media.audio) {
          try {
            await sock.sendMessage(
              msg.chat,
              {
                audio: { url: r.media.audio },
                mimetype: 'audio/mpeg',
                ptt: false
              },
              { quoted: msg }
            );
          } catch (e) {
            console.log('Error enviando audio:', e.message);
          }
        }

        await msg.react('✅');
        return;
      }

      throw new Error('Formato de TikTok no soportado.');

    } catch (err) {
      console.error('TikTok Error:', err);

      await msg.react('❌');

      return msg.reply(
        '*🌟 Ocurrió un error al descargar el TikTok. Intenta nuevamente más tarde.*'
      );
    }
  },
};
