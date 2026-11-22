
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

    if (!/(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/i.test(args[0])) {
      await msg.react('❌');
      return msg.reply('*☁️ Enlace de TikTok inválido.*');
    }

    try {
      await msg.react('🕒');

      const api = `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(args[0])}`;

      const res = await fetch(api);

      if (!res.ok) throw new Error('La API no respondió');

      const json = await res.json();

      if (!json.status || !json.data?.success) {
        throw new Error('Respuesta inválida de la API');
      }

      const r = json.data;

      const caption = `
*👤 Autor:* ${r.author || 'Desconocido'}
*📛 Usuario:* ${r.username || '-'}
*📝 Título:* ${r.description || 'Sin título'}

📥 *Descargado por KanBot*
`.trim();

      await msg.react('📤');

      //=========================
      // 🎥 VIDEO
      //=========================
      if (r.type === 'video') {
        const video =
          r.video?.hd?.url ||
          r.video?.sd?.url ||
          r.video?.watermark?.url ||
          r.video?.hd?.source ||
          r.video?.sd?.source;

        if (!video) {
          throw new Error('No se encontró el video');
        }

        await sock.sendMessage(
          msg.chat,
          {
            video: { url: video },
            caption
          },
          { quoted: msg }
        );

        // Audio del TikTok
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
            console.error('Error enviando audio:', e.message);
          }
        }

        await msg.react('✅');
        return;
      }

      //=========================
      // 🖼️ IMÁGENES / SLIDES
      //=========================
      if ((r.type === 'slide' || r.type === 'image') && Array.isArray(r.images)) {

        const images = r.images
          .map(img => typeof img === 'string' ? img : img?.url)
          .filter(Boolean);

        if (!images.length) {
          throw new Error('No se encontraron imágenes');
        }

        for (let i = 0; i < images.length; i++) {
          await sock.sendMessage(
            msg.chat,
            {
              image: { url: images[i] },
              caption: i === 0 ? caption : undefined
            },
            { quoted: msg }
          );
        }

        // Audio del TikTok de imágenes
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
            console.error('Error enviando audio:', e.message);
          }
        }

        await msg.react('✅');
        return;
      }

      throw new Error('Formato de TikTok no soportado.');

    } catch (e) {
      console.error('TikTok Error:', e.message);

      await msg.react('❌');

      return msg.reply(
        '*🌟 Ocurrió un error al descargar el TikTok. Intenta nuevamente más tarde.*'
      );
    }
  },
};
