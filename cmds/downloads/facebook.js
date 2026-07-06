import axios from "axios";
import fetch from "node-fetch";
import { fileTypeFromBuffer } from "file-type";

export default {
  command: ["facebook", "fb"],
  category: "downloads",
  description: "",
  run: async ({ msg, sock, args }) => {

    if (!args[0]) {
      return msg.reply("🎈 *Ingresa un link de Facebook*");
    }

    const facebookRegex = /^(https?:\/\/)?(www\.)?(facebook\.com|fb\.watch)\/.+$/i;

    if (!facebookRegex.test(args[0])) {
      return msg.reply("❌ *El enlace proporcionado no es válido.*");
    }

    await msg.react("⏳");

    let result;

    try {

      const response = await fetch(
        "https://api.siputzx.my.id/api/d/facebook",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: args[0]
          })
        }
      );

      const json = await response.json();

      if (!json.status || !json.data?.downloads?.length) {
        throw new Error("No se encontraron enlaces");
      }

      let video =
        json.data.downloads.find(v =>
          v.quality?.includes("720p") &&
          v.url
        ) ||

        json.data.downloads.find(v =>
          v.quality?.includes("HD") &&
          v.url
        ) ||

        json.data.downloads.find(v =>
          v.quality?.includes("360p") &&
          v.url
        ) ||

        json.data.downloads.find(v =>
          v.url
        );

      if (!video?.url) {
        throw new Error("Sin URL válida");
      }

      result = {
        title: json.data.title || "Facebook Video",
        videoUrl: video.url,
        quality: video.quality || "Desconocida",
        thumb: json.data.thumbnail || null,
        duration: json.data.duration || "-"
      };

    } catch (err) {

      console.error("❌ Error API:", err);

      await msg.react("❌");

      return msg.reply("❎ *No se pudo obtener el video de Facebook.*");
    }

    try {

      await msg.react("📥");

      const { data } = await axios.get(
        result.videoUrl,
        {
          responseType: "arraybuffer",
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        }
      );

      const buffer = Buffer.from(data);
      const type = await fileTypeFromBuffer(buffer);

      await sock.sendMessage(
        msg.chat,
        {
          video: buffer,
          mimetype: type?.mime || "video/mp4",
          fileName: "facebook.mp4",
          caption: `🎥 *${result.title}*
⏱️ Duración: ${result.duration}
📺 Calidad: ${result.quality}

✨ *_By KanBot_*`
        },
        { quoted: msg }
      );

      await msg.react("✅");

    } catch (err) {

      console.error("❌ Error al enviar:", err);

      await msg.react("❌");

      return msg.reply("❌ *Error al enviar el video. Intenta nuevamente.*");
    }
  },
};
