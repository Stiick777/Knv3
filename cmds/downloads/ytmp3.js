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
      // ============================================================
// 🔥 APIs de descarga
// ============================================================
let title = "audio";
let author = "Desconocido";
let views = "0";
let likes = "0";
let image = "";
let download = "";

// 🥇 AlyaCore V2
try {
  const res = await fetch(
    `https://api.alyacore.xyz/dl/ytmp3v2?url=${encodeURIComponent(text)}&key=LUFFY-FIX67`
  );
  const json = await res.json();

  if (!json.status || !json.data?.dl) {
    throw new Error("AlyaCore V2 falló");
  }

  title = json.data.title || title;
  image = json.data.thumbnail || "";
  download = json.data.dl;

} catch {

  // 🔁 AlyaCore V1
  try {
    const res = await fetch(
      `https://api.alyacore.xyz/dl/ytmp3?url=${encodeURIComponent(text)}&key=LUFFY-FIX67`
    );
    const json = await res.json();

    if (!json.status || !json.data?.dl) {
      throw new Error("AlyaCore V1 falló");
    }

    title = json.data.title || title;
    author = json.data.author || author;
    image = json.data.thumbnail || "";
    download = json.data.dl;

  } catch {

    // 🆘 Yuki Wabot
    const res = await fetch(
      `https://api.yuki-wabot.my.id/dl/ytmp3v2?url=${encodeURIComponent(text)}&key=YukiBot-MD`
    );
    const json = await res.json();

    if (!json.status || !json.data?.dl) {
      throw new Error("Todas las APIs fallaron");
    }

    title = json.data.fileName
      ? json.data.fileName.replace(/\.mp3$/i, "")
      : title;

    download = json.data.dl;
  }
}

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
