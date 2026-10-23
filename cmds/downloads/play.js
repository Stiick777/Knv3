
import fetch from 'node-fetch';
import yts from 'yt-search';

export default {
  command: ['play'],
  category: 'downloads',
  description: 'Descarga audio de YouTube',

  run: async ({ msg, sock, args, text }) => {
    if (!text) {
      return msg.reply(`*𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚎𝚕 𝚗𝚘𝚖𝚋𝚛𝚎 𝚍𝚎 𝚕𝚘 𝚚𝚞𝚎 𝚚𝚞𝚒𝚎𝚛𝚎𝚜 𝚋𝚞𝚜𝚌𝚊𝚛*`);
    }

    await msg.react('🕓');

    try {
      // 🔎 Buscar en YouTube
      const yt_play = await search(args.join(' '));

      if (!yt_play || !yt_play.length) {
        await msg.react('❌');
        return msg.reply('❌ No encontré ningún resultado en YouTube.');
      }

      const video = yt_play[0];
      const duracion = video.duration?.seconds || 0;

      // ⏱️ Verificar duración
      if (duracion > 3600) {
        await msg.react('❌');
        return msg.reply('❗ *El audio es superior a 1h*');
      }

      const texto1 = `
𝚈𝚘𝚞𝚝𝚞𝚋𝚎 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚜

> 𝚃𝚒𝚝𝚞𝚕𝚘 : ${video.title}
> 𝙲𝚛𝚎𝚊𝚍𝚘 : ${video.ago || 'Desconocido'}
> 𝙳𝚞𝚛𝚊𝚌𝚒𝚘𝚗 : ${secondString(duracion)}

🚀 𝙎𝙀 𝙀𝙎𝙏𝘼 𝘿𝙀𝙎𝘼𝙍𝙂𝘼𝙉𝘿𝙊 𝙎𝙐 𝘼𝙐𝘿𝙄𝙊, 𝙀𝙎𝙋𝙀𝙍𝙀 𝙐𝙉 𝙈𝙊𝙈𝙀𝙉𝙏𝙊
===========================
✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰
> Provided by Stiiven
`.trim();

      // 🖼️ Enviar miniatura
      await sock.sendFile(
        msg.chat,
        video.thumbnail,
        'error.jpg',
        texto1,
        msg,
        null
      );

      // 🎵 API ALYACORE
      const apiUrl =
        `https://api.alyacore.xyz/dl/ytmp3?url=${encodeURIComponent(video.url)}&key=LUFFY-FIX67`;

      const res = await fetch(apiUrl);

      if (!res.ok) {
        throw new Error(`Error en API AlyaCore: ${res.status}`);
      }

      const json = await res.json();

      if (!json.status || !json.data?.dl) {
        throw new Error('AlyaCore no devolvió el enlace de descarga');
      }

      const downloadUrl = json.data.dl;

      const title =
        json.data.title && json.data.title !== '-'
          ? json.data.title
          : video.title || 'audio';

      // 🎵 Descargar audio
      const audioRes = await fetch(downloadUrl);

      if (!audioRes.ok) {
        throw new Error(`Error descargando audio: ${audioRes.status}`);
      }

      const audioBuffer = Buffer.from(
        await audioRes.arrayBuffer()
      );

      // 🎵 Enviar audio
      await sock.sendMessage(
        msg.chat,
        {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${title.replace(/[\\/:*?"<>|]/g, '_')}.mp3`,
          ptt: false
        },
        { quoted: msg }
      );

      await msg.react('✅');

    } catch (err) {
      console.error('Error en play:', err.message);

      await msg.react('❌');

      await sock.sendMessage(
        msg.chat,
        {
          text: '❌ Error al descargar el audio.'
        },
        { quoted: msg }
      );
    }
  }
};


// 📌 Buscar en YouTube
async function search(query, options = {}) {
  const result = await yts.search({
    query,
    hl: 'es',
    gl: 'ES',
    ...options
  });

  return result.videos;
}


// 📌 Convertir segundos a texto
function secondString(seconds) {
  seconds = Number(seconds);

  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay =
    d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';

  const hDisplay =
    h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';

  const mDisplay =
    m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';

  const sDisplay =
    s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';

  return dDisplay + hDisplay + mDisplay + sDisplay;
}
