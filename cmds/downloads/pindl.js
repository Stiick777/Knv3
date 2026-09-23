import axios from 'axios';

export default {
  command: ['pindl'],
  category: 'downloads',
  description: 'Descarga contenido de Pinterest',

  run: async ({ msg, sock, args, text }) => {

    if (!args[0]) {
      await msg.react('❌');

      return sock.sendMessage(
        msg.chat,
        {
          text: `*📌 Ingrese un enlace de Pinterest.*\n\n*💌 Ejemplo:* _/pindl https://pin.it/2Vflx5O_`
        },
        { quoted: msg }
      );
    }

    if (!/(?:https?:\/\/)?(?:www\.)?(pin\.it|pinterest\.com)\/[^\s]+/i.test(args[0])) {
      await msg.react('❌');

      return sock.sendMessage(
        msg.chat,
        {
          text: `*📌 Ingrese un enlace válido de Pinterest.*\n\n*💌 Ejemplo:* _/pindl https://pin.it/2Vflx5O_`
        },
        { quoted: msg }
      );
    }

    try {
      await msg.react('🕒');

      const { data } = await axios.get(
        `https://api.delirius.online/download/pinterestdl?url=${encodeURIComponent(args[0])}`
      );

      if (!data.status || !data.data || !data.data.download) {
        await msg.react('❌');

        return sock.sendMessage(
          msg.chat,
          {
            text: '*🚩 No se pudo procesar el enlace de Pinterest.*'
          },
          { quoted: msg }
        );
      }

      const info = data.data;
      const download = info.download;

      const caption = `*📌 Título:* ${info.title || 'Sin título'}
*📝 Descripción:* ${info.description?.trim() || 'Sin descripción'}
*👤 Autor:* ${info.author_name || 'Desconocido'} ${info.username || ''}
*📅 Subido:* ${info.upload || '-'}

💬 *Comentarios:* ${info.comments ?? 0}
❤️ *Likes:* ${info.likes ?? 0}

📥 *Descargado exitosamente.*`;

      await msg.react('📤');

      if (download.type === 'video') {

        await sock.sendMessage(
          msg.chat,
          {
            video: { url: download.url },
            caption
          },
          { quoted: msg }
        );

      } else if (download.type === 'image') {

        await sock.sendMessage(
          msg.chat,
          {
            image: { url: download.url },
            caption
          },
          { quoted: msg }
        );

      } else {

        await msg.react('❌');

        return sock.sendMessage(
          msg.chat,
          {
            text: '⚠️ Tipo de archivo no soportado.'
          },
          { quoted: msg }
        );
      }

      await msg.react('✅');

    } catch (error) {

      console.error(error);

      await msg.react('❌');

      return sock.sendMessage(
        msg.chat,
        {
          text: '*⚠️ Error al procesar la solicitud de Pinterest.*'
        },
        { quoted: msg }
      );
    }
  }
};
