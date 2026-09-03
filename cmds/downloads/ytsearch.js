import yts from "yt-search";

export default {
  command: ["playlist", "ytbuscar", "yts", "ytsearch"],
  category: "search",
  description: "Busca videos en YouTube",

  run: async ({ msg, sock, text, args, command, usedPrefix }) => {

    // ==============================
    // TEXTO DE BÚSQUEDA
    // ==============================
    if (!text) {
      text = args?.join(" ");
    }

    if (!text?.trim()) {
      return msg.reply(
        `🏳 *Escriba el título de algún vídeo de YouTube*\n\n` +
        `Ejemplo: ${usedPrefix}${command} heyser`
      );
    }

    try {

      await msg.react("⌛");

      // ==============================
      // BUSCAR EN YOUTUBE
      // ==============================
      const search = await yts(text.trim());

      const videos = search.videos
        .filter(video => video?.url && video?.thumbnail)
        .slice(0, 6);

      if (!videos.length) {
        await msg.react("❌");
        return msg.reply("⚠️ No se encontraron resultados.");
      }

      // ==============================
      // ENVIAR RESULTADOS
      // ==============================
      for (let i = 0; i < videos.length; i++) {

        const video = videos[i];

        const title = video.title || "Sin título";
        const author = video.author?.name || "Desconocido";
        const duration = video.timestamp || "Desconocida";
        const ago = video.ago || "Desconocido";
        const views = Number(video.views || 0).toLocaleString("es-CO");

        const caption =
          `🔎 *Resultado ${i + 1}/${videos.length}*\n\n` +
          `🎬 *${title}*\n\n` +
          `👤 *Canal:* ${author}\n` +
          `⏱️ *Duración:* ${duration}\n` +
          `📅 *Publicado:* ${ago}\n` +
          `👀 *Vistas:* ${views}\n\n` +
          `🔗 ${video.url}`;

        await sock.sendMessage(
          msg.chat,
          {
            image: {
              url: video.thumbnail
            },

            caption,

            footer: "☆ KanBot ☆",

            buttonsFormat: "buttons",

            buttons: [

              {
                text: "🎵 MP3",
                id: `${usedPrefix}yta ${video.url}`
              },

              {
                text: "🎥 MP4",
                id: `${usedPrefix}ytv ${video.url}`
              },

              {
                text: "🔗 Copiar URL",
                copy: video.url
              }

            ]

          },
          {
            quoted: msg
          }
        );
      }

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
