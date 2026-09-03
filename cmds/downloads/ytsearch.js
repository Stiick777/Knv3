import yts from "yt-search";
import {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia
} from "baileys";

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

      // ==============================
      // BUSCAR EN YOUTUBE
      // ==============================
      const search = await yts(text.trim());

      const videos = search.videos
        .filter(v => v?.url && v?.thumbnail)
        .slice(0, 6);

      if (!videos.length) {
        await msg.react("❌");
        return msg.reply("⚠️ No se encontraron resultados.");
      }

      // ==============================
      // CREAR TARJETAS
      // ==============================
      const cards = [];

      for (const video of videos) {

        // Preparar correctamente la imagen
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

        const card = proto.Message.InteractiveMessage.CarouselMessage.Card.fromObject({
          
          // ==========================
          // CABECERA
          // ==========================
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: video.author?.name || "YouTube",
            hasMediaAttachment: true,
            ...media
          }),

          // ==========================
          // CUERPO
          // ==========================
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text:
              `🎬 *${video.title}*\n\n` +
              `👤 ${video.author?.name || "Desconocido"}\n` +
              `⏱️ ${video.timestamp || "Desconocido"}\n` +
              `📅 ${video.ago || "Desconocido"}\n` +
              `👀 ${Number(video.views || 0).toLocaleString("es-CO")} vistas`
          }),

          // ==========================
          // FOOTER
          // ==========================
          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: "☆ KanBot ☆"
          }),

          // ==========================
          // BOTONES
          // ==========================
          nativeFlowMessage:
            proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({

              buttons: [

                // MP3
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🎵 MP3",
                    id: `${usedPrefix}yta ${video.url}`
                  })
                },

                // MP4
                {
                  name: "quick_reply",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🎥 MP4",
                    id: `${usedPrefix}ytv ${video.url}`
                  })
                },

                // COPIAR URL
                {
                  name: "cta_copy",
                  buttonParamsJson: JSON.stringify({
                    display_text: "🔗 Copiar URL",
                    copy_code: video.url
                  })
                }

              ],

              messageParamsJson: ""
            })
        });

        cards.push(card);
      }

      // ==============================
      // MENSAJE PRINCIPAL
      // ==============================
      const carousel = proto.Message.InteractiveMessage.CarouselMessage.fromObject({
        cards
      });

      const interactiveMessage =
        proto.Message.InteractiveMessage.fromObject({

          // ==========================
          // CUERPO PRINCIPAL
          // ==========================
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text:
              `🔎 *RESULTADOS PARA:*\n` +
              `_${text.trim()}_`
          }),

          // ==========================
          // FOOTER PRINCIPAL
          // ==========================
          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text:
              `📺 ${videos.length} resultados encontrados\n` +
              `☆ KanBot ☆`
          }),

          // ==========================
          // HEADER
          // ==========================
          header: proto.Message.InteractiveMessage.Header.fromObject({
            hasMediaAttachment: false
          }),

          // ==========================
          // CARRUSEL
          // ==========================
          carouselMessage: carousel
        });

      // ==============================
      // CONSTRUIR MENSAJE WHATSAPP
      // ==============================
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

      // ==============================
      // ENVIAR
      // ==============================
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
