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

      const api = `https://neji-api.vercel.app/api/downloader/tiktok?url=${encodeURIComponent(args[0])}`;
      const res = await fetch(api);

      if (!res.ok) throw new Error('La API no respondió');

      const json = await res.json();

      if (!json.status || !json.result) {
        throw new Error('Respuesta inválida de la API');
      }

      const r = json.result;

      const caption = `
*👤 Autor:* ${r.author_info?.nickname || 'Desconocido'}
*🎵 Música:* ${r.music?.title || 'Desconocida'}
*📝 Título:* ${r.title || 'Sin título'}
*⏱ Duración:* ${r.cover?.duration || 0}s

📥 *Descargado por KanBot*
`.trim();

      await msg.react('📤');

      // Enviar video sin marca de agua
      await sock.sendMessage(
        msg.chat,
        {
          video: {
            url: r.cover?.play
          },
          caption
        },
        { quoted: msg }
      );

      // Enviar audio
      if (r.cover?.mp3) {
        try {
          await sock.sendMessage(
            msg.chat,
            {
              audio: {
                url: r.cover.mp3
              },
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

    } catch (err) {
      console.error('❌ TikTok Error:', err);

      await msg.react('❌');

      return msg.reply(
        '*🌟 Error al procesar el TikTok, intenta nuevamente más tarde.*'
      );
    }
  },
};
