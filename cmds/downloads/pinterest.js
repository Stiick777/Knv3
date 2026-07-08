import axios from "axios";
import fileType from "file-type";

const MAX_IMAGES = 6;

export default {
  command: ["pinterest", "pin", "pimg"],
  category: "search",
  description: "",
  run: async ({ msg, sock, args, text, usedPrefix, command }) => {
    if (!text) text = args?.join(" ");

    if (!text) {
      return msg.reply(
        `*💡 Uso Correcto:* ${usedPrefix + command} gato`
      );
    }

    await msg.react("📌");

    try {
      const apiUrl = `https://api.delirius.store/search/pinterest?text=${encodeURIComponent(text)}`;

      const { data: json } = await axios.get(apiUrl);

      if (!json.status || !json.results?.length) {
        return msg.reply(
          `❌ No encontré resultados para *${text}*`
        );
      }

      const images = json.results.slice(0, MAX_IMAGES);

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

      // Imagen principal
      const firstImg = await loadImage(images[0]);

      await sock.sendMessage(
        msg.chat,
        {
          image: firstImg.buffer,
          mimetype: firstImg.mime,
          caption: `📍 *Resultados de Pinterest*\n🔎 *${text}*`,
          contextInfo: {
            externalAdReply: {
              title: "KanBot",
              body: "Pinterest Search • Delirius API",
              mediaType: 1,
              mediaUrl: "https://www.pinterest.com/",
              thumbnailUrl: images[0],
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
