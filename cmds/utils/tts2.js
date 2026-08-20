import axios from "axios";

const TIKWM_SEARCH_URL = "https://www.tikwm.com/api/feed/search";

const MAX_VIDEOS = 7;
const REQUEST_TIMEOUT_MS = 15000;

export default {
  command: ["tts2"],
  category: "search",
  description: "Busca videos en TikTok",

  run: async ({ msg, sock, args, usedPrefix, command }) => {

    // ==========================================
    // VALIDAR ARGUMENTOS
    // ==========================================

    if (!args.length) {
      return msg.reply(
`*💡 Uso correcto:*

${usedPrefix + command} gatos 3

🎬 Debes indicar la cantidad de videos que deseas enviar.

*Mínimo:* 1
*Máximo:* ${MAX_VIDEOS}`
      );
    }

    const lastArg = args[args.length - 1];

    const hasNumber = /^\d+$/.test(lastArg);

    // Texto de búsqueda sin la cantidad
    const text = hasNumber
      ? args.slice(0, -1).join(" ").trim()
      : args.join(" ").trim();

    // ==========================================
    // VALIDAR CANTIDAD
    // ==========================================

    if (!hasNumber) {
      return msg.reply(
`❌ *Proporciona la cantidad de videos que deseas enviar.*

*Ejemplo:*
${usedPrefix + command} ${text} 3

*Mínimo:* 1
*Máximo:* ${MAX_VIDEOS}`
      );
    }

    const amount = Number(lastArg);

    if (amount < 1) {
      return msg.reply(
        "❌ La cantidad debe ser mayor a *0*."
      );
    }

    if (amount > MAX_VIDEOS) {
      return msg.reply(
        `❌ Solo puedes solicitar un máximo de *${MAX_VIDEOS} videos*.`
      );
    }

    if (!text) {
      return msg.reply(
`❌ Debes escribir una búsqueda.

*Ejemplo:*
${usedPrefix + command} gatos 3`
      );
    }

    // ==========================================
    // REACCIÓN
    // ==========================================

    await msg.react("⌛");

    try {

      // ==========================================
      // BUSCAR EN TIKWM
      // ==========================================

      const searchResults = await searchTikTokVideos(text);

      if (!searchResults.length) {
        await msg.react("❌");

        return msg.reply(
          `❌ No encontré resultados para *${text}*.`
        );
      }

      // Mezclar resultados para que no siempre
      // aparezcan exactamente los mismos videos
      const videos = shuffleArray(searchResults)
        .slice(0, amount);

      if (!videos.length) {
        await msg.react("❌");

        return msg.reply(
          `❌ No encontré suficientes videos para *${text}*.`
        );
      }

      // ==========================================
      // FUNCIÓN PARA DESCARGAR VIDEO
      // ==========================================

      const loadVideo = async (url) => {

        if (!url) {
          throw new Error("URL de video no válida");
        }

        const response = await axios.get(url, {
          responseType: "arraybuffer",
          timeout: 60000,

          headers: {
            Referer: "https://www.tiktok.com/",
            "User-Agent":
              "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
          }
        });

        return Buffer.from(response.data);
      };

      // ==========================================
      // PRIMER VIDEO
      // ==========================================

      const first = videos[0];

      try {

        const videoBuffer = await loadVideo(first.play);

        await sock.sendMessage(
          msg.chat,
          {
            video: videoBuffer,
            mimetype: "video/mp4",

            caption:
`🎬 *RESULTADOS DE TIKTOK*

🔎 *Búsqueda:* ${text}

📹 *Videos enviados:* ${videos.length}

👤 *Autor:* ${first.author || "Desconocido"}

📝 *Título:*
${first.title || "Video de TikTok"}

━━━━━━━━━━━━━━━━━━
✨ *KanBot • TikTok Search*`,

            contextInfo: {
              externalAdReply: {
                title:
                  first.title?.slice(0, 70) ||
                  "TikTok Search",

                body:
                  `TikTok • ${videos.length} video(s)`,

                mediaType: 1,

                mediaUrl:
                  first.url ||
                  "https://www.tiktok.com/",

                sourceUrl:
                  first.url ||
                  "https://www.tiktok.com/",

                renderLargerThumbnail: true,
                showAdAttribution: false
              }
            }
          },
          {
            quoted: msg
          }
        );

      } catch (e) {

        console.error(
          "❌ Error enviando primer video:",
          e.message
        );

      }

      // ==========================================
      // ENVIAR RESTO DE VIDEOS
      // ==========================================

      for (let i = 1; i < videos.length; i++) {

        const video = videos[i];

        try {

          const videoBuffer = await loadVideo(
            video.play
          );

          await sock.sendMessage(
            msg.chat,
            {
              video: videoBuffer,
              mimetype: "video/mp4"
            },
            {
              quoted: msg
            }
          );

        } catch (e) {

          console.error(
            `❌ Error descargando video ${i + 1}:`,
            e.message
          );

        }
      }

      // ==========================================
      // FINALIZAR
      // ==========================================

      await msg.react("✅");

    } catch (e) {

      console.error(
        "❌ Error TikTok Search:",
        e
      );

      await msg.react("❌");

      await msg.reply(
        `❌ *Error al buscar videos en TikTok.*\n\n${e.message}`
      );
    }
  }
};


// ======================================================
// BUSCAR VIDEOS EN TIKWM
// ======================================================

async function searchTikTokVideos(text) {

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {

    const body = new URLSearchParams({
      keywords: text,
      count: "10",
      cursor: "0",
      HD: "1"
    });

    const response = await fetch(
      TIKWM_SEARCH_URL,
      {
        method: "POST",

        body,

        signal: controller.signal,

        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",

          Cookie:
            "current_language=en",

          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36"
        }
      }
    );

    if (!response.ok) {
      throw new Error(
        `TikWM respondió con HTTP ${response.status}`
      );
    }

    const payload = await response.json();

    const videos =
      Array.isArray(payload?.data?.videos)
        ? payload.data.videos
        : [];

    return videos
      .filter(video => video?.play)

      .map(video => ({
        title:
          video.title ||
          "TikTok Video",

        author:
          video.author?.nickname ||
          "Desconocido",

        play:
          video.play,

        url:
          buildTikTokUrl(video),

        videoId:
          video.video_id
      }));

  } catch (error) {

    console.error(
      "❌ Error buscando en TikTok:",
      error
    );

    return [];

  } finally {

    clearTimeout(timeout);
  }
}


// ======================================================
// CONSTRUIR URL DE TIKTOK
// ======================================================

function buildTikTokUrl(video) {

  const uniqueId =
    video.author?.unique_id;

  const videoId =
    video.video_id;

  if (uniqueId && videoId) {
    return `https://www.tiktok.com/@${uniqueId}/video/${videoId}`;
  }

  return video.play;
}


// ======================================================
// MEZCLAR RESULTADOS
// ======================================================

function shuffleArray(array) {

  const copy = [...array];

  for (
    let i = copy.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(Math.random() * (i + 1));

    [copy[i], copy[j]] =
      [copy[j], copy[i]];
  }

  return copy;
                }
