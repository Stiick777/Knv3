import axios from "axios";

export default {
  command: ["tiktoksearch", "tts", "tiktoks"],
  category: "search",
  description: "Busca un video en TikTok",

  run: async ({ msg, sock, args }) => {

    if (!args.length) {
      return msg.reply(
        "❌ Escribe lo que quieres buscar.\n\nEjemplo: *.tiktoksearch gato*"
      );
    }

    const text = args.join(" ");

    await msg.react("⌛");

    try {

      // ==========================================
      // BUSCAR EN TIKWM
      // ==========================================

      const body = new URLSearchParams({
        keywords: text,
        cursor: "0",
        HD: "1"
      });

      const response = await axios.post(
        "https://www.tikwm.com/api/feed/search",
        body,
        {
          timeout: 15000,
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Cookie: "current_language=en",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
          }
        }
      );

      const videos = response.data?.data?.videos;

      if (!Array.isArray(videos) || !videos.length) {
        await msg.react("❌");

        return msg.reply(
          `❌ No encontré videos para: *${text}*`
        );
      }

      // ==========================================
      // PRIMER VIDEO
      // ==========================================

      const video = videos[0];

      if (!video.play) {
        await msg.react("❌");
        return msg.reply("❌ El video no tiene una URL válida.");
      }

      // ==========================================
      // DESCARGAR VIDEO
      // ==========================================

      const videoResponse = await axios.get(
        video.play,
        {
          responseType: "arraybuffer",
          timeout: 60000,
          headers: {
            Referer: "https://www.tiktok.com/",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
          }
        }
      );

      const buffer = Buffer.from(videoResponse.data);

      // ==========================================
      // ENVIAR
      // ==========================================

      await sock.sendMessage(
        msg.chat,
        {
          video: buffer,
          mimetype: "video/mp4",
          caption:
`🎬 *TikTok Search*

🔎 Búsqueda: ${text}

👤 Autor: ${video.author?.nickname || "Desconocido"}

📝 ${video.title || "Video de TikTok"}`
        },
        {
          quoted: msg
        }
      );

      await msg.react("✅");

    } catch (error) {

      console.error("Error TikTok Search:", error);

      await msg.react("❌");

      await msg.reply(
        `❌ Error al buscar el video.\n\n${error.message}`
      );
    }
  }
};
