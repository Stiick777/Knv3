import axios from "axios";

const MAX_VIDEOS = 10;

export default {
  command: ["tiktoksearch", "tts", "tiktoks"],
  category: "search",
  description: "Busca videos en TikTok",

  run: async ({ msg, sock, args, usedPrefix, command }) => {

    // ==========================================
    // VALIDAR ARGUMENTOS
    // ==========================================

    if (!args.length) {
      return msg.reply(
`*💡 Uso correcto:*

${usedPrefix + command} gatos 3

🎬 Debes indicar la cantidad de videos que deseas enviar.

*Mínimo:* 1
*Máximo:* ${MAX_VIDEOS}`
      );
    }

    const lastArg = args[args.length - 1];

    const hasNumber = /^\d+$/.test(lastArg);

    // Texto de búsqueda sin la cantidad
    const text = hasNumber
      ? args.slice(0, -1).join(" ").trim()
      : args.join(" ").trim();

    // ==========================================
    // VALIDAR CANTIDAD
    // ==========================================

    if (!hasNumber) {
      return msg.reply(
`❌ *Proporciona la cantidad de videos que deseas enviar.*

*Ejemplo:*
${usedPrefix + command} ${text} 3

*Mínimo:* 1
*Máximo:* ${MAX_VIDEOS}`
      );
    }

    const amount = Number(lastArg);

    if (amount < 1) {
      return msg.reply(
        "❌ La cantidad debe ser mayor a *0*."
      );
    }

    if (amount > MAX_VIDEOS) {
      return msg.reply(
        `❌ Solo puedes solicitar un máximo de *${MAX_VIDEOS} videos*.`
      );
    }

    if (!text) {
      return msg.reply(
`❌ Debes escribir una búsqueda.

*Ejemplo:*
${usedPrefix + command} gatos 3`
      );
    }

    // ==========================================
    // REACCIÓN
    // ==========================================

    await msg.react("⌛");

    try {

      // ==========================================
      // API LEMPI
      // ==========================================

      const apiUrl =
        `https://api.lempi.lat/s/tiktok` +
        `?q=${encodeURIComponent(text)}` +
        `&count=${amount}` +
        `&apikey=montekey28`;

      const { data } = await axios.get(apiUrl, {
        timeout: 30000
      });

      if (
        !data?.status ||
        !Array.isArray(data.resultados) ||
        !data.resultados.length
      ) {
        await msg.react("❌");

        return msg.reply(
          `❌ No encontré resultados para *${text}*.`
        );
      }

      const videos = data.resultados.slice(0, amount);

      // ==========================================
      // FUNCIÓN PARA DESCARGAR VIDEO
      // ==========================================

      const loadVideo = async (url) => {

        const response = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 60000,
          headers: {
            Referer: "https://www.tiktok.com/",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        });

        return Buffer.from(response.data);
      };

      // ==========================================
      // PRIMER VIDEO
      // ==========================================

      const first = videos[0];

      try {

        const videoBuffer = await loadVideo(first.video);

        await sock.sendMessage(
          msg.chat,
          {
            video: videoBuffer,
            mimetype: "video/mp4",

            caption:
`🎬 *RESULTADOS DE TIKTOK*

🔎 *Búsqueda:* ${text}

📹 *Videos enviados:* ${videos.length}
👤 *Autor:* ${first.autor?.nombre || "Desconocido"}
🔹 *@${first.autor?.usuario || "-"}*

👁️ *Vistas:* ${first.estadisticas?.vistas || 0}
❤️ *Likes:* ${first.estadisticas?.likes || 0}
💬 *Comentarios:* ${first.estadisticas?.comentarios || 0}
🔁 *Compartidos:* ${first.estadisticas?.compartidos || 0}

⏱️ *Duración:* ${first.duracion || 0}s
📺 *Calidad:* ${first.calidad || "SD"}

🎵 *${first.musica?.titulo || "Audio desconocido"}*
🎤 ${first.musica?.autor || "Desconocido"}

━━━━━━━━━━━━━━━━━━
✨ *KanBot • TikTok Search*`,

            contextInfo: {
              externalAdReply: {
                title:
                  first.titulo?.slice(0, 70) ||
                  "TikTok Search",

                body:
                  `TikTok • ${videos.length} video(s)`,

                mediaType: 1,

                mediaUrl:
                  first.url ||
                  "https://www.tiktok.com/",

                thumbnailUrl:
                  first.portada,

                sourceUrl:
                  first.url,

                renderLargerThumbnail: true,
                showAdAttribution: false
              }
            }
          },
          {
            quoted: msg
          }
        );

      } catch (e) {

        console.error(
          "❌ Error enviando primer video:",
          e.message
        );

        // Si falla el primero, intentamos continuar
      }

      // ==========================================
      // ENVIAR RESTO DE VIDEOS
      // ==========================================

      for (let i = 1; i < videos.length; i++) {

        const video = videos[i];

        try {

          const videoBuffer = await loadVideo(
            video.video
          );

          await sock.sendMessage(
            msg.chat,
            {
              video: videoBuffer,
              mimetype: "video/mp4"
            },
            {
              quoted: msg
            }
          );

        } catch (e) {

          console.error(
            `❌ Error descargando video ${i + 1}:`,
            e.message
          );

        }
      }

      // ==========================================
      // FINALIZAR
      // ==========================================

      await msg.react("✅");

    } catch (e) {

      console.error(
        "❌ Error TikTok Search:",
        e
      );

      await msg.react("❌");

      await msg.reply(
        `❌ *Error al buscar videos en TikTok.*\n\n${e.message}`
      );
    }
  }
};
