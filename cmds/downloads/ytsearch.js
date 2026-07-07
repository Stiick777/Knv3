import yts from 'yt-search';
const baileys = await import("baileys");

const {
  proto,
  generateWAMessageFromContent,
  generateWAMessageContent
} = baileys;

export default {
  command: ['playlist', 'ytbuscar', 'yts', 'ytsearch'],
  category: 'search',
  description: '',
  run: async ({ msg, sock, text, args, command, usedPrefix }) => {
    if (!text) {
      text = args?.join(' ');
    }

    if (!text) {
      return msg.reply(
        `🏳 *Escriba el título de algún vídeo de YouTube*\n\nEjemplo: ${usedPrefix + command} heyser`
      );
    }

    const results = await yts(text);
    const videos = results.videos.slice(0, 6);

    if (!videos.length) {
      return msg.reply('⚠️ No se encontraron resultados.');
    }

    const cards = [];

for (const video of videos) {
  const { imageMessage } = await generateWAMessageContent(
    {
      image: { url: video.thumbnail }
    },
    {
      upload: sock.waUploadToServer
    }
  );

  cards.push({
    body: proto.Message.InteractiveMessage.Body.fromObject({
      text:
        `🎬 ${video.title}\n\n` +
        `⏱ ${video.timestamp}\n` +
        `📅 ${video.ago}\n` +
        `👀 ${Number(video.views || 0).toLocaleString()} vistas`
    }),

    footer: proto.Message.InteractiveMessage.Footer.fromObject({
      text: "☆ KanBot ☆"
    }),

    header: proto.Message.InteractiveMessage.Header.fromObject({
      title: video.author?.name || "YouTube",
      hasMediaAttachment: true,
      imageMessage
    }),

    nativeFlowMessage:
      proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "🎵 MP3",
              id: `/ytmp3 ${video.url}`
            })
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "🎥 MP4",
              id: `/ytmp4 ${video.url}`
            })
          }
        ]
      })
  });
}

const waMsg = generateWAMessageFromContent(
  msg.chat,
  {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage:
          proto.Message.InteractiveMessage.fromObject({
            body: {
              text: `🔎 *RESULTADOS PARA:* ${text}`
            },

            footer: {
              text: `📺 Se encontraron ${videos.length} resultados\nby ☆KanBot☆`
            },

            header: {
              hasMediaAttachment: false
            },

            carouselMessage: {
              cards
            }
          })
      }
    }
  },
  {
    quoted: msg
  }
);

await sock.relayMessage(
  msg.chat,
  waMsg.message,
  {
    messageId: waMsg.key.id
  }
);
