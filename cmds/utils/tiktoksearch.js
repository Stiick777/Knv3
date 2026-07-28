import axios from "axios";

const baileys = await import("baileys");

const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent
} = baileys;

export default {
  command: ["tiktoksearch", "tts", "tiktoks"],
  category: "search",
  description: "",
  run: async ({ msg, sock, text }) => {

    if (!text) {
      return msg.reply(
        "❕ ¿QUÉ BÚSQUEDA DESEA REALIZAR EN TIKTOK?"
      );
    }

    async function createVideoMessage(url) {
      const { data } = await axios.get(url, {
        responseType: "arraybuffer",
        headers: {
          Referer: "https://www.tiktok.com/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      });

      const buffer = Buffer.from(data);

      const { videoMessage } = await generateWAMessageContent(
        {
          video: buffer,
          mimetype: "video/mp4"
        },
        {
          upload: sock.waUploadToServer
        }
      );

      return videoMessage;
    }

    function shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }

    try {

      await msg.react("⌛");

      const { data } = await axios.get(
        `https://neji-api.vercel.app/api/search/tiktok?q=${encodeURIComponent(text)}`
      );

      if (!data?.results?.length) {
        throw new Error("No se encontraron resultados");
      }

      let results = data.results;
      shuffleArray(results);

      let cards = [];

      for (const result of results.slice(0, 7)) {
        try {

          cards.push({
            body: proto.Message.InteractiveMessage.Body.fromObject({
              text:
                `👤 ${result.author?.nickname || "Desconocido"}\n` +
                `👁 ${Number(result.stats?.play_count || 0).toLocaleString()}\n` +
                `❤️ ${Number(result.stats?.digg_count || 0).toLocaleString()} | 💬 ${Number(result.stats?.comment_count || 0).toLocaleString()}\n` +
                `🔁 ${Number(result.stats?.share_count || 0).toLocaleString()}\n` +
                `⏱ ${result.duration || 0}s`
            }),

            footer: proto.Message.InteractiveMessage.Footer.fromObject({
              text: `🎵 Audio disponible`
            }),

            header: proto.Message.InteractiveMessage.Header.fromObject({
              title: result.title?.slice(0, 80) || "TikTok Video",
              hasMediaAttachment: true,
              videoMessage: await createVideoMessage(result.play)
            }),

            nativeFlowMessage:
              proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                  {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                      display_text: "Ver Video",
                      url: `https://www.tiktok.com/@${result.author?.unique_id}/video/${result.id}`
                    })
                  }
                ]
              })
          });

        } catch (e) {
          console.error(
            "Error cargando video:",
            result.id,
            e.message
          );
        }
      }

      if (!cards.length) {
        throw new Error(
          "No fue posible generar las tarjetas."
        );
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
                    text: `✨ *RESULTADOS DE:* ${text}`
                  },

                  footer: {
                    text: `🔎 Se encontraron ${results.length} resultados\nby ☆KanBot☆`
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

    } catch (err) {

      console.error(err);

      await msg.react("❌");

      msg.reply(
        `❌ *ERROR:* ${err.message}`
      );
    }
  },
};
