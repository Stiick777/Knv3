import fetch from "node-fetch";

export default {
  command: ['ytmp3', 'yta'],
  category: 'downloads',
  description: '',
  run: async ({ msg, sock, text, args }) => {
    try {
      if (!text) {
        text = args?.join(" ");
      }

      if (!text || !isValidYouTubeUrl(text)) {
        return msg.reply(
          '⚠️ Proporciona un *enlace válido de YouTube*.'
        );
      }

      await msg.react('⏳');

      // ============================================================
      // 🔥 API DELIRIUS
      // ============================================================
      const apiUrl = `https://api.delirius.store/download/ytmp3?url=${encodeURIComponent(text)}`;

      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json.status || !json.data?.download) {
        throw new Error("La API no devolvió el audio.");
      }

      const {
        title = "audio",
        author = "Desconocido",
        views = "0",
        likes = "0",
        image,
        download
      } = json.data;

      // ============================================================
      // 📦 Obtener tamaño del archivo
      // ============================================================
      let sizeMB = 0;
      try {
        const head = await fetch(download, { method: "HEAD" });
        const length = head.headers.get("content-length");
        sizeMB = length ? Number(length) / (1024 * 1024) : 0;
      } catch {
        sizeMB = 0;
      }

      await msg.react('✅');

      // ============================================================
      // 📸 Portada
      // ============================================================
      if (image) {
        await sock.sendMessage(
          msg.chat,
          {
            image: { url: image },
            caption:
`🎶 *${title}*

👤 Autor: ${author}
👁️ Vistas: ${Number(views).toLocaleString()}
❤️ Likes: ${Number(likes).toLocaleString()}
📦 Tamaño: ${sizeMB.toFixed(2)} MB
🎧 Formato: MP3`
          },
          { quoted: msg }
        );
      }

      // ============================================================
      // 🎧 Audio o documento
      // ============================================================
      const isHeavy = sizeMB > 10;

      await sock.sendMessage(
        msg.chat,
        {
          [isHeavy ? "document" : "audio"]: { url: download },
          mimetype: "audio/mpeg",
          fileName: `${title}.mp3`,
          ...(isHeavy && {
            caption: "📁 Archivo enviado como documento por superar 10 MB."
          })
        },
        { quoted: msg }
      );

    } catch (error) {
      console.error("Error YTMP3:", error);

      await msg.react('❌');

      return msg.reply(`⚠️ Error: ${error.message}`);
    }
  },
};

// ============================================================
// 🔍 Validación de enlace YouTube
// ============================================================
function isValidYouTubeUrl(url) {
  const regex =
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{11}/;
  return regex.test(url.trim());
}
