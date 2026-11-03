
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

      const api = `https://api-faa.my.id/faa/tiktok?url=${encodeURIComponent(args[0])}`;

      const res = await fetch(api);

      if (!res.ok) throw new Error('La API no respondió');

      const json = await res.json();

      if (!json.status || !json.result) {
        throw new Error('Respuesta inválida de la API');
      }

      const r = json.result;

      const caption = `
*👤 Autor:* ${r.author?.nickname || 'Desconocido'}
*📛 Usuario:* ${r.author?.username || '-'}
*📝 Título:* ${r.title || 'Sin título'}

*❤️ Likes:* ${r.stats?.likes || '0'}
*👁️ Vistas:* ${r.stats?.views || '0'}
*💬 Comentarios:* ${r.stats?.comment || '0'}
*🔁 Compartidos:* ${r.stats?.share || '0'}

📥 *Descargado por KanBot*
`.trim();

      await msg.react('📤');

      //=========================
      // 🎥 VIDEO
      //=========================
      if (r.type === 'video') {
        const video =
          r.alternatives?.hd ||
          r.alternatives?.selected ||
          r.data;

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
        if (r.music_info?.url) {
          try {
            await sock.sendMessage(
              msg.chat,
              {
                audio: { url: r.music_info.url },
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
      if (r.type === 'image' && Array.isArray(r.data)) {
        for (let i = 0; i < r.data.length; i++) {
          await sock.sendMessage(
            msg.chat,
            {
              image: { url: r.data[i] },
              caption: i === 0 ? caption : undefined
            },
            { quoted: msg }
          );
        }

        // Audio del TikTok de imágenes
        if (r.music_info?.url) {
          try {
            await sock.sendMessage(
              msg.chat,
              {
                audio: { url: r.music_info.url },
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

    } catch (err) {
      console.error('TikTok Error:', err.message);

      await msg.react('❌');

      return msg.reply(
        '*🌟 Ocurrió un error al descargar el TikTok. Intenta nuevamente más tarde.*'
      );
    }
  },
};
