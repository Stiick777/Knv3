import yts from "yt-search";

export default {
  command: ["playlist", "ytbuscar", "yts", "ytsearch"],
  category: "search",
  description: "Busca videos en YouTube",

  run: async ({ msg, sock, text, args, command, usedPrefix }) => {

    if (!text) text = args?.join(" ");

    if (!text?.trim()) {
      return msg.reply(
        `🏳 *Escriba el título de algún vídeo de YouTube*\n\n` +
        `Ejemplo: ${usedPrefix}${command} heyser`
      );
    }

    try {

      await msg.react("⌛");

      // ==========================================
      // BUSCAR YOUTUBE
      // ==========================================

      const search = await yts(text.trim());

      const videos = search.videos
        .filter(v => v?.url && v?.thumbnail)
        .slice(0, 6);

      if (!videos.length) {
        await msg.react("❌");
        return msg.reply("⚠️ No se encontraron resultados.");
      }

      // ==========================================
      // CREAR TARJETAS
      // ==========================================

      const cards = videos.map((video, index) => {

        const title = video.title || "Sin título";
        const author = video.author?.name || "Desconocido";
        const duration = video.timestamp || "Desconocida";
        const ago = video.ago || "Desconocido";
        const views = Number(video.views || 0)
          .toLocaleString("es-CO");

        // Comandos que se copiarán
        const mp3Command = `${usedPrefix}yta ${video.url}`;
        const mp4Command = `${usedPrefix}ytv ${video.url}`;

        return {

          // ========================================
          // IMAGEN DE LA TARJETA
          // ========================================

          image: {
            url: video.thumbnail
          },

          // ========================================
          // TEXTO DE LA TARJETA
          // ========================================

          caption:
            `🎬 *${title}*\n\n` +
            `👤 *Canal:* ${author}\n` +
            `⏱️ *Duración:* ${duration}\n` +
            `📅 *Publicado:* ${ago}\n` +
            `👀 *Vistas:* ${views}\n\n` +
            `📌 *Resultado ${index + 1}/${videos.length}`,

          footer: "☆ KanBot ☆",

          // ========================================
          // BOTONES
          // ========================================

          nativeFlow: [

            // MP3
            {
              name: "cta_copy",

              buttonParamsJson: JSON.stringify({
                display_text: "🎵 MP3",
                id: `ytmp3_${index}`,
                copy_code: mp3Command
              })
            },

            // MP4
            {
              name: "cta_copy",

              buttonParamsJson: JSON.stringify({
                display_text: "🎥 MP4",
                id: `ytmp4_${index}`,
                copy_code: mp4Command
              })
            }

          ]
        };
      });

      // ==========================================
      // CARRUSEL
      // ==========================================

      await sock.sendMessage(
        msg.chat,
        {
          text:
            `🔎 *RESULTADOS PARA:*\n` +
            `_${text.trim()}_`,

          footer:
            `📺 ${videos.length} resultados encontrados\n` +
            `☆ KanBot ☆`,

          cards,

          viewOnce: true

        },
        {
          quoted: msg
        }
      );

      await msg.react("✅");

    } catch (error) {

      console.error(
        "[YTSEARCH ERROR]",
        error
      );

      await msg.react("❌");

      await msg.reply(
        `❌ *Error al realizar la búsqueda.*\n\n` +
        `${error?.message || error}`
      );
    }
  }
};
