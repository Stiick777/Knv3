import axios from "axios";
import fetch from "node-fetch";
import { fileTypeFromBuffer } from "file-type";

const MAX_IMAGES = 6;

export default {
  command: ["pinterest", "pin", "pimg"],
  category: "search",
  description: "",
  run: async ({ msg, sock, args, text, usedPrefix, command }) => {
    if (!text) {
      text = args?.join(" ");
    }

    if (!text) {
      return msg.reply(
        `*💡 Uso Correcto:* ${usedPrefix + command} gato`
      );
    }

    await msg.react("📌");

    try {
      const apiUrl = `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}&type=image`;

      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json.status || !json.data || !json.data.length) {
        return msg.reply(
          `❌ No encontré resultados para *${text}*`
        );
      }

      const images = json.data
        .filter(v => v.image_url)
        .slice(0, MAX_IMAGES);

      const loadImage = async (url) => {
        const { data } = await axios.get(url, {
          responseType: "arraybuffer",
          headers: {
            Referer: "https://www.pinterest.com/",
            "User-Agent": "Mozilla/5.0"
          }
        });

        const buffer = Buffer.from(data);
        const type = await fileTypeFromBuffer(buffer);

        return {
          buffer,
          mime: type?.mime || "image/jpeg"
        };
      };

      // Imagen principal
      const firstImg = await loadImage(images[0].image_url);

      await sock.sendMessage(
        msg.chat,
        {
          image: firstImg.buffer,
          mimetype: firstImg.mime,
          caption: `📍 *Resultados de Pinterest*\n🔎 *${text}*`,
          contextInfo: {
            externalAdReply: {
              title: "KanBot",
              body: "Pinterest Search • Siputzx API",
              mediaType: 1,
              mediaUrl: images[0].pin,
              thumbnailUrl: images[0].image_url,
              previewType: 0
            }
          }
        },
        { quoted: msg }
      );

      // Enviar el resto de imágenes
      for (let i = 1; i < images.length; i++) {
        try {
          const img = await loadImage(images[i].image_url);

          await sock.sendMessage(
            msg.chat,
            {
              image: img.buffer,
              mimetype: img.mime
            },
            { quoted: msg }
          );
        } catch (e) {
          console.log(`❌ Error descargando: ${images[i].image_url}`);
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
