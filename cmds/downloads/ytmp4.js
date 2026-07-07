import axios from "axios";
import fetch from "node-fetch";
import fileType from "file-type";

export default {
  command: ["ytmp4", "ytvideo", "ytv"],
  category: "downloads",
  description: "",
  run: async ({ msg, sock, args }) => {
    if (!args[0]) {
      return msg.reply(
        `*[❗INFO❗]* Ingresa un enlace de *YouTube* para descargar el video.`
      );
    }

    const youtubeLink = args[0];
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;

    if (!youtubeRegex.test(youtubeLink)) {
      return msg.reply(
        `⚠️ Asegúrate de ingresar un enlace válido de YouTube.`
      );
    }

    await msg.react("🕓");

    try {
      let title;
      let quality;
      let downloadUrl;
      let servidor;

      // ==============================
      // API PRINCIPAL: DELIRIUS
      // ==============================
      try {
        const { data } = await axios.get(
          `https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(youtubeLink)}&format=360p`
        );

        if (!data?.status || !data?.data?.download) {
          throw new Error("Respuesta inválida de Delirius");
        }

        title = data.data.title || "Video";
        quality = data.data.format || "360p";
        downloadUrl = data.data.download;
        servidor = "Delirius";

      } catch (e) {
        console.log("Delirius falló, usando ZennzXD...");

        // ==============================
        // API RESPALDO: ZENNZXD
        // ==============================
        const { data } = await axios.get(
          `https://api.zenzxz.my.id/download/youtube?url=${encodeURIComponent(youtubeLink)}&format=360`
        );

        if (!data?.status || !data?.result?.download) {
          throw new Error("Respuesta inválida de ZennzXD");
        }

        title = data.result.title || "Video";
        quality = `${data.result.format}p`;
        downloadUrl = data.result.download;
        servidor = "ZennzXD";
      }

      // ==============================
      // Obtener tamaño real
      // ==============================
      let sizeMB = 0;

      try {
        const head = await fetch(downloadUrl, {
          method: "HEAD"
        });

        const length = head.headers.get("content-length");

        if (length) {
          sizeMB = Number(length) / (1024 * 1024);
        }
      } catch {
        sizeMB = 0;
      }

      // ==============================
      // Descargar video
      // ==============================
      const videoRes = await axios.get(downloadUrl, {
        responseType: "arraybuffer"
      });

      const buffer = Buffer.from(videoRes.data);
      const type = await fileType.fromBuffer(buffer);

      await msg.react("✅");

      const isHeavy = sizeMB > 30;

      const caption = `🎬 *${title}*
🎞️ *Calidad:* ${quality}
📏 *Tamaño:* ${sizeMB ? sizeMB.toFixed(2) + " MB" : "Desconocido"}
🌐 *Servidor:* ${servidor}

${isHeavy
  ? "📁 Enviado como documento (más de 30 MB)"
  : "😎 Video descargado por KanBot"
}`;

      await sock.sendMessage(
        msg.chat,
        {
          [isHeavy ? "document" : "video"]: buffer,
          fileName: `${title}.mp4`,
          mimetype: type?.mime || "video/mp4",
          caption
        },
        { quoted: msg }
      );

    } catch (err) {
      console.error("Error descarga:", err);

      await msg.react("❌");

      await sock.sendMessage(
        msg.chat,
        {
          text: "❌ No se pudo descargar el video desde ningún servidor."
        },
        { quoted: msg }
      );
    }
  },
};
