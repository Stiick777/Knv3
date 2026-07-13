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
// 🥇 API PRINCIPAL: APICAUSAS
// ==============================
try {

  const { data } = await axios.get(
    `https://rest.apicausas.xyz/api/v1/descargas/youtube?apikey=causa-ee5ee31dcfc79da4&url=${encodeURIComponent(youtubeLink)}&type=video&quality=420`
  );

  if (
    !data.status ||
    !data.data ||
    !data.data.download ||
    !data.data.download.url
  ) {
    throw new Error("ApiCausas inválida");
  }

  title = data.data.title || "Video";
  quality = data.data.quality_tag || "420p";
  downloadUrl = data.data.download.url;
  servidor = "ApiCausas";

} catch (e1) {

  console.log("ApiCausas falló, usando StellarWA...");

  // ==============================
  // 🥈 RESPALDO: STELLARWA
  // ==============================
  try {

    const { data } = await axios.get(
      `https://api.stellarwa.xyz/dl/ytmp4?url=${encodeURIComponent(youtubeLink)}&key=proyectsV2`
    );

    if (
      !data.status ||
      !data.result ||
      !data.result.downloadUrl
    ) {
      throw new Error("StellarWA inválida");
    }

    title = data.result.title || "Video";
    quality = data.result.format || "360p";
    downloadUrl = data.result.downloadUrl;
    servidor = "StellarWA";

  } catch (e2) {

    console.log("StellarWA falló, usando Fare...");

    // ==============================
    // 🥉 RESPALDO: FARE.INK
    // ==============================
    const { data } = await axios.get(
      `https://fare.ink/dl/ytv?url=${encodeURIComponent(youtubeLink)}&apikey=kanbot`,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    if (
      !data.status ||
      !data.descarga ||
      !data.descarga.url
    ) {
      throw new Error("Fare inválida");
    }

    title = data.titulo || "Video";
    quality = data.descarga.calidad || "360p";
    downloadUrl = data.descarga.url;
    servidor = "Fare";
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
