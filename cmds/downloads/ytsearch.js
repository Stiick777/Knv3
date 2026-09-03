import yts from "yt-search";

const baileys = await import("baileys");

const {
  proto,
  prepareWAMessageMedia,
  generateWAMessageFromContent
} = baileys;

export default {
  command: ["playlist", "ytbuscar", "yts", "ytsearch"],
  category: "search",
  description: "",

  run: async ({ msg, sock, text, args, command, usedPrefix }) => {

    if (!text) text = args?.join(" ");

    if (!text) {
      return msg.reply(
        `🏳 *Escriba el título de algún vídeo de YouTube*\n\n` +
        `Ejemplo: ${usedPrefix + command} ckane`
      );
    }

    try {

      await msg.react("⌛");

      const search = await yts(text);
      const videos = search.videos.slice(0, 6);

      if (!videos.length) {
        await msg.react("❌");
        return msg.reply("⚠️ No se encontraron resultados.");
      }

      // ─────────────────────────────
      // CREAR LAS 6 CARDS
      // ─────────────────────────────

      const cards = [];

      for (let i = 0; i < videos.length; i++) {

        const video = videos[i];

        // Preparar imagen para WhatsApp
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

        const card = {
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: video.author?.name || "YouTube",
            hasMediaAttachment: true,
            ...media
          }),

          body: proto.Message.InteractiveMessage.Body.fromObject({
            text:
              `🎬 ${video.title}\n\n` +
              `⏱️ ${video.timestamp || "Desconocido"}\n` +
              `📅 ${video.ago || "Desconocido"}\n` +
              `👀 ${Number(video.views || 0).toLocaleString()} vistas`
          }),

          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: `☆ KanBot ☆ • ${i + 1}/${videos.length}`
          }),

          nativeFlowMessage:
            proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({

              buttons: [

                {
                  name: "cta_copy",

                  buttonParamsJson: JSON.stringify({
                    display_text: "🎵 MP3",
                    id: `ytmp3_${i}`,
                    copy_code: `${usedPrefix}yta ${video.url}`
                  })
                },

                {
                  name: "cta_copy",

                  buttonParamsJson: JSON.stringify({
                    display_text: "🎥 MP4",
                    id: `ytmp4_${i}`,
                    copy_code: `${usedPrefix}ytv ${video.url}`
                  })
                }

              ],

              messageParamsJson: ""
            })
        };

        cards.push(card);
      }

      // ─────────────────────────────
      // CREAR CAROUSEL
      // ─────────────────────────────

      const interactiveMessage =
        proto.Message.InteractiveMessage.fromObject({

          body: {
            text: `🔎 *RESULTADOS PARA:* ${text}`
          },

          footer: {
            text:
              `📺 ${videos.length} resultados encontrados\n` +
              `Desliza para ver más`
          },

          header: {
            hasMediaAttachment: false
          },

          carouselMessage:
            proto.Message.InteractiveMessage.CarouselMessage.fromObject({

              cards: cards,

              messageVersion: 1,

              carouselCardType:
                proto.Message.InteractiveMessage
                  .CarouselMessage
                  .CarouselCardType
                  .HSCROLL_CARDS
          })
        });

      // ─────────────────────────────
      // GENERAR MENSAJE
      // ─────────────────────────────

      const waMsg = generateWAMessageFromContent(
        msg.chat,

        {
          interactiveMessage
        },

        {
          quoted: msg,
          userJid: sock.user?.id
        }
      );

      // ─────────────────────────────
      // ENVIAR
      // ─────────────────────────────

      await sock.relayMessage(
        msg.chat,
        waMsg.message,
        {
          messageId: waMsg.key.id
        }
      );

      await msg.react("✅");

    } catch (e) {

      console.error("YTSEARCH CAROUSEL ERROR:", e);

      await msg.react("❌");

      await msg.reply(
        `❌ Error al crear el carrusel:\n\n${e.message}`
      );
    }
  }
};
