import yts from "yt-search";

const baileys = await import("baileys");

const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent
} = baileys;

export default {
  command: ["playlist", "ytbuscar", "yts", "ytsearch"],
  category: "search",
  description: "",
  run: async ({ msg, sock, text, args, command, usedPrefix }) => {

    if (!text) text = args?.join(" ");

    if (!text) {
      return msg.reply(
        `🏳 *Escriba el título de algún vídeo de YouTube*\n\nEjemplo: ${usedPrefix + command} heyser`
      );
    }

    try {

      await msg.react("⌛");

      const search = await yts(text);
      const videos = search.videos.slice(0, 6);

      if (!videos.length) {
        return msg.reply("⚠️ No se encontraron resultados.");
      }

      let cards = [];

      for (const video of videos) {

        const { imageMessage } = await generateWAMessageContent(
          {
            image: {
              url: video.thumbnail
            }
          },
          {
            upload: sock.waUploadToServer
          }
        );

        cards.push({
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text:
              `🎬 ${video.title}\n\n` +
              `⏱ ${video.timestamp}\n` +
              `📅 ${video.ago}\n` +
              `👀 ${Number(video.views).toLocaleString()} vistas`
          }),

          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: "☆KanBot☆"
          }),

          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: video.author.name,
            hasMediaAttachment: true,
            imageMessage
          }),

          nativeFlowMessage:
  proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
    buttons: [
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "🎵 Copiar MP3",
          copy_code: `/yta ${video.url}`
        })
      },
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "🎥 Copiar MP4",
          copy_code: `/ytv ${video.url}`
        })
      }
    ]
  })
        });

      }

      const waMsg = generateWAMessageFromContent(
        msg.chat,
        {
          viewOnceMessage: {
            message: {
              messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2
              },
              interactiveMessage:
                proto.Message.InteractiveMessage.fromObject({
                  body: {
                    text: `🔎 *RESULTADOS PARA:* ${text}`
                  },

                  footer: {
                    text: `📺 Se encontraron ${search.videos.length} resultados\nby ☆KanBot☆`
                  },

                  header: {
                    hasMediaAttachment: false
                  },

                  carouselMessage: {
                    cards
                  }
                })
            }
          }
        },
        {
          quoted: msg
        }
      );

      await sock.relayMessage(
        msg.chat,
        waMsg.message,
        {
          messageId: waMsg.key.id
        }
      );

      await msg.react("✅");

    } catch (e) {

      console.error(e);

      await msg.react("❌");

      msg.reply(`❌ Error: ${e.message}`);

    }
  },
};
