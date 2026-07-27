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

          // ==============================
      // 🥇 API PRINCIPAL: FAA
      // ==============================
      try {

        const { data } = await axios.get(
          `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(youtubeLink)}`
        );

        if (
          !data.status ||
          !data.result ||
          !data.result.download_url
        ) {
          throw new Error("FAA inválida");
        }

        title = "Video";
        quality = data.result.format || "mp4";
        downloadUrl = data.result.download_url;
        servidor = "FAA";

      } catch (e1) {

        console.log("FAA falló, usando Yuki-Wabot...");

        // ==============================
        // 🥈 RESPALDO: YUKI-WABOT
        // ==============================
        try {

          const { data } = await axios.get(
            `https://api.yuki-wabot.my.id/dl/ytmp4v2?url=${encodeURIComponent(youtubeLink)}&key=YukiBot-MD`
          );

          if (
            !data.status ||
            !data.download ||
            !data.download.url
          ) {
            throw new Error("Yuki inválida");
          }

          title = data.data?.title || "Video";
          quality = `${data.download.quality}p`;
          downloadUrl = data.download.url;
          servidor = "Yuki-Wabot";

        } catch (e2) {

          console.log("Yuki-Wabot falló, usando AlyaCore...");

          // ==============================
          // 🥉 RESPALDO: ALYACORE
          // ==============================
          try {

            const { data } = await axios.get(
              `https://api.alyacore.xyz/dl/ytmp4?url=${encodeURIComponent(youtubeLink)}&quality=auto&key=LUFFY-FIX67`
            );

            if (
              !data.status ||
              !data.data ||
              !data.data.dl
            ) {
              throw new Error("AlyaCore inválida");
            }

            title = data.data.title || "Video";
            quality = data.data.quality || "Auto";
            downloadUrl = data.data.dl;
            servidor = "AlyaCore";

          } catch (e3) {
            throw new Error("Todas las APIs fallaron");
          }
        }
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
