import yts from "yt-search";

const baileys = await import("baileys");

const {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia
} = baileys;

console.log(
  Object.keys(proto.Message.InteractiveMessage || {})
);

console.log(
  Object.keys(proto.Message.InteractiveMessage?.CarouselMessage || {})
);
console.log(
  proto.Message.InteractiveMessage?.CarouselMessage
);
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
      // BUSCAR EN YOUTUBE
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

      const cards = [];

      for (const video of videos) {

        // Preparar miniatura
        const media = await prepareWAMessageMedia(
          {
            image: {
              url: video.thumbnail
            }
          },
          {
            upload: sock.waUploadToServer
          }
        );

        const title = video.title || "Sin título";
        const author = video.author?.name || "Desconocido";
        const duration = video.timestamp || "Desconocida";
        const ago = video.ago || "Desconocido";
        const views = Number(video.views || 0).toLocaleString("es-CO");

        // ========================================
        // COMANDOS QUE SE COPIARÁN
        // ========================================

        const mp3Command = `${usedPrefix}yta ${video.url}`;
        const mp4Command = `${usedPrefix}ytv ${video.url}`;

        cards.push({

          // ======================================
          // HEADER
          // ======================================

          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: author,
            hasMediaAttachment: true,
            ...media
          }),

          // ======================================
          // BODY
          // ======================================

          body: proto.Message.InteractiveMessage.Body.fromObject({
            text:
              `🎬 *${title}*\n\n` +
              `👤 ${author}\n` +
              `⏱️ ${duration}\n` +
              `📅 ${ago}\n` +
              `👀 ${views} vistas`
          }),

          // ======================================
          // FOOTER
          // ======================================

          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: "☆ KanBot ☆"
          }),

          // ======================================
          // BOTONES
          // ======================================

          nativeFlowMessage:
            proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({

              buttons: [

                // --------------------------------
                // COPIAR COMANDO MP3
                // --------------------------------

                {
                  name: "cta_copy",

                  buttonParamsJson: JSON.stringify({
                    display_text: "🎵 MP3",
                    id: `ytmp3_${Date.now()}_${Math.random()}`,
                    copy_code: mp3Command
                  })
                },

                // --------------------------------
                // COPIAR COMANDO MP4
                // --------------------------------

                {
                  name: "cta_copy",

                  buttonParamsJson: JSON.stringify({
                    display_text: "🎥 MP4",
                    id: `ytmp4_${Date.now()}_${Math.random()}`,
                    copy_code: mp4Command
                  })
                }

              ],

              messageParamsJson: ""
            })
        });
      }

      // ==========================================
      // CREAR CARRUSEL
      // ==========================================

      const carouselMessage =
        proto.Message.InteractiveMessage.CarouselMessage.fromObject({
          cards
        });

      // ==========================================
      // MENSAJE INTERACTIVO
      // ==========================================

      const interactiveMessage =
        proto.Message.InteractiveMessage.fromObject({

          body: proto.Message.InteractiveMessage.Body.fromObject({
            text:
              `🔎 *RESULTADOS PARA:*\n` +
              `_${text.trim()}_`
          }),

          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text:
              `📺 ${videos.length} resultados\n` +
              `☆ KanBot ☆`
          }),

          header: proto.Message.InteractiveMessage.Header.fromObject({
            hasMediaAttachment: false
          }),

          carouselMessage
        });

      // ==========================================
      // CREAR MENSAJE WHATSAPP
      // ==========================================

      const waMsg = generateWAMessageFromContent(
        msg.chat,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },

              interactiveMessage
            }
          }
        },
        {
          quoted: msg
        }
      );

      // ==========================================
      // ENVIAR CARRUSEL
      // ==========================================

      await sock.relayMessage(
        msg.chat,
        waMsg.message,
        {
          messageId: waMsg.key.id
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
