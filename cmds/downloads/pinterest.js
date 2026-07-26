import axios from "axios";
import fileType from "file-type";

const MAX_IMAGES = 15;

export default {
  command: ["pinterest", "pin", "pimg"],
  category: "search",
  description: "",
  run: async ({ msg, sock, args, usedPrefix, command }) => {

    if (!args.length) {
      return msg.reply(
`*💡 Uso correcto:*

${usedPrefix + command} gatos 5

📌 Debes indicar la cantidad de imágenes que deseas enviar.

*Mínimo:* 1
*Máximo:* ${MAX_IMAGES}`
      );
    }

    const lastArg = args[args.length - 1];

    if (!/^\d+$/.test(lastArg)) {
      return msg.reply(
`❌ *Proporciona un número para el envío de las imágenes.*

*Ejemplo:*
${usedPrefix + command} gatos 5

*Mínimo:* 1
*Máximo:* ${MAX_IMAGES}`
      );
    }

    const amount = Number(lastArg);

    if (amount < 1) {
      return msg.reply("❌ La cantidad debe ser mayor a *0*.");
    }

    if (amount > MAX_IMAGES) {
      return msg.reply(
        `❌ Solo puedes solicitar un máximo de *${MAX_IMAGES} imágenes*.`
      );
    }

    const text = args.slice(0, -1).join(" ").trim();

    if (!text) {
      return msg.reply(
`❌ Debes escribir una búsqueda.

*Ejemplo:*
${usedPrefix + command} gatos 5`
      );
    }

    await msg.react("📌");

    try {
      const apiUrl = `https://neji-api.vercel.app/api/search/pinterest?q=${encodeURIComponent(text)}&limit=${amount}`;

      const { data: json } = await axios.get(apiUrl);

      if (!json.success || !json.results?.length) {
        await msg.react("❌");
        return msg.reply(`❌ No encontré resultados para *${text}*`);
      }

      const images = json.results;

      const loadImage = async (url) => {
        const { data } = await axios.get(url, {
          responseType: "arraybuffer",
          headers: {
            Referer: "https://www.pinterest.com/",
            "User-Agent": "Mozilla/5.0"
          }
        });

        const buffer = Buffer.from(data);
        const type = await fileType.fromBuffer(buffer);

        return {
          buffer,
          mime: type?.mime || "image/jpeg"
        };
      };

      // Primera imagen
      const firstImg = await loadImage(images[0]);

      await sock.sendMessage(
        msg.chat,
        {
          image: firstImg.buffer,
          mimetype: firstImg.mime,
          caption:
`📍 *Resultados de Pinterest*

🔎 *Búsqueda:* ${text}
🖼️ *Imágenes enviadas:* ${images.length}`,
          contextInfo: {
            externalAdReply: {
              title: "KanBot",
              body: "Pinterest Search • Neji API",
              mediaType: 1,
              mediaUrl: "https://www.pinterest.com/",
              thumbnail: firstImg.buffer,
              previewType: 0
            }
          }
        },
        { quoted: msg }
      );

      // Enviar el resto de imágenes
      for (let i = 1; i < images.length; i++) {
        try {
          const img = await loadImage(images[i]);

          await sock.sendMessage(
            msg.chat,
            {
              image: img.buffer,
              mimetype: img.mime
            },
            { quoted: msg }
          );
        } catch (e) {
          console.log(`❌ Error descargando: ${images[i]}`);
        }
      }

      await msg.react("✅");

    } catch (e) {
      console.error(e);
      await msg.react("❌");

      await msg.reply(
        "❌ Error al buscar imágenes en Pinterest."
      );
    }
  },
};
