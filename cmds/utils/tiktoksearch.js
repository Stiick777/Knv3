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
  description: "Busca videos en TikTok",

  run: async ({ msg, sock, text }) => {

    if (!text) {
      return msg.reply(
        "❕ ¿QUÉ BÚSQUEDA DESEA REALIZAR EN TIKTOK?"
      );
    }

    // Descargar video y convertirlo en mensaje de WhatsApp
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

      // ==========================================
      // API TIKTOK
      // ==========================================

      const apiUrl =
        `https://api.lempi.lat/s/tiktok?q=${encodeURIComponent(text)}` +
        `&count=7&apikey=montekey28`;

      const { data } = await axios.get(apiUrl, {
        timeout: 30000
      });

      if (!data?.status) {
        throw new Error(
          "La API de TikTok no respondió correctamente."
        );
      }

      if (!Array.isArray(data.resultados) || !data.resultados.length) {
        throw new Error(
          "No se encontraron resultados para esa búsqueda."
        );
      }

      let results = data.resultados;

      // Mezclar resultados
      shuffleArray(results);

      let cards = [];

      // Máximo 7 tarjetas
      for (const result of results.slice(0, 7)) {

        try {

          const autor = result.autor || {};
          const stats = result.estadisticas || {};
          const musica = result.musica || {};

          cards.push({

            body:
              proto.Message.InteractiveMessage.Body.fromObject({
                text:
                  `👤 ${autor.nombre || "Desconocido"}\n` +
                  `   @${autor.usuario || "-"}\n\n` +

                  `👁️ Vistas: ${stats.vistas || 0}\n` +
                  `❤️ Likes: ${stats.likes || 0}\n` +
                  `💬 Comentarios: ${stats.comentarios || 0}\n` +
                  `🔁 Compartidos: ${stats.compartidos || 0}\n` +
                  `⭐ Favoritos: ${stats.favoritos || 0}\n` +
                  `⏱️ Duración: ${result.duracion || 0}s\n` +
                  `📺 Calidad: ${result.calidad || "SD"}`
              }),

            footer:
              proto.Message.InteractiveMessage.Footer.fromObject({
                text:
                  `🎵 ${musica.titulo || "Audio desconocido"}` +
                  ` • ${musica.autor || ""}`
              }),

            header:
              proto.Message.InteractiveMessage.Header.fromObject({
                title:
                  result.titulo?.slice(0, 80) ||
                  "TikTok Video",

                hasMediaAttachment: true,

                videoMessage:
                  await createVideoMessage(result.video)
              }),

            nativeFlowMessage:
              proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({

                buttons: [
                  {
                    name: "cta_url",

                    buttonParamsJson: JSON.stringify({
                      display_text: "Ver en TikTok",
                      url: result.url
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

      // ==========================================
      // MENSAJE CARRUSEL
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

              interactiveMessage:
                proto.Message.InteractiveMessage.fromObject({

                  body: {
                    text:
                      `✨ *RESULTADOS DE:* ${text}`
                  },

                  footer: {
                    text:
                      `🔎 Se encontraron ${data.total || results.length} resultados\n` +
                      `👤 Creadores: ${data.creadores || "Desconocidos"}\n` +
                      `by ☆KanBot☆`
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

      console.error(
        "Error TikTok Search:",
        err
      );

      await msg.react("❌");

      await msg.reply(
        `❌ *ERROR:* ${err.message}`
      );
    }
  }
};
