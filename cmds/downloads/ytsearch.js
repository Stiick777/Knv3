import yts from 'yt-search';

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

    const messages = videos.map(video => [
      video.title,
      `🎬 *Título:* ${video.title}
⏱ *Duración:* ${video.timestamp}
📅 *Subido:* ${video.ago}
🎈 para descargar copie y pegue el comando:
⟨∆⟩ boton 1 mp3
⟨∆⟩ boton 2 mp4

「✰」 provided by KanBot`,
      video.thumbnail,
      [[]],
      [
        [`/ytmp3 ${video.url}`],
        [`/ytmp4 ${video.url}`]
      ]
    ]);

    await sock.sendCarousel(
      msg.chat,
      `🔎 Resultados para: *${text}*`,
      '📺 YouTube Search',
      null,
      messages,
      msg
    );
  },
};
