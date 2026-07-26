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

    // Buscar en YouTube
    const yt_play = await search(args.join(' '));

    // Verificar duración
    const duracion = yt_play[0].duration.seconds || 0;
    if (duracion > 3600) {
      return msg.reply("❗ *El audio es superior a 1h*");
    }

    const texto1 = `
𝚈𝚘𝚞𝚝𝚞𝚋𝚎 𝙳𝚎𝚜𝚌𝚊𝚛𝚐𝚊𝚜

> 𝚃𝚒𝚝𝚞𝚕𝚘 :  ${yt_play[0].title}
> 𝙲𝚛𝚎𝚊𝚍𝚘 :  ${yt_play[0].ago}
> 𝙳𝚞𝚛𝚊𝚌𝚒𝚘𝚗 :  ${secondString(yt_play[0].duration.seconds)}

🚀 𝙎𝙀 𝙀𝙎𝙏𝘼 𝘿𝙀𝙎𝘼𝙍𝙂𝘼𝙉𝘿𝙊 𝙎𝙐 𝘼𝙐𝘿𝙄𝙊, 𝙀𝙎𝙋𝙀𝙍𝙀 𝙐𝙉 𝙈𝙊𝙈𝙀𝙉𝙏𝙊
===========================
✰ 𝙺𝚊𝚗𝙱𝚘𝚝 ✰
> Provided by Stiiven
`.trim();

    await sock.sendFile(
      msg.chat,
      yt_play[0].thumbnail,
      'error.jpg',
      texto1,
      msg,
      null
    );

    

 try {
  await msg.react('🕓');

  const url = yt_play[0].url;
  let title = 'audio';
  let downloadUrl = '';

  // 🥇 AlyaCore V2
  try {
    const res = await fetch(
      `https://api.alyacore.xyz/dl/ytmp3v2?url=${encodeURIComponent(url)}&key=LUFFY-FIX67`
    );
    const json = await res.json();

    if (json.status && json.data?.dl) {
      title = json.data.title || title;
      downloadUrl = json.data.dl;
    } else {
      throw new Error('AlyaCore V2 sin datos');
    }

  } catch {

    // 🔁 AlyaCore V1
    try {
      const res = await fetch(
        `https://api.alyacore.xyz/dl/ytmp3?url=${encodeURIComponent(url)}&key=LUFFY-FIX67`
      );
      const json = await res.json();

      if (json.status && json.data?.dl) {
        title = json.data.title || title;
        downloadUrl = json.data.dl;
      } else {
        throw new Error('AlyaCore V1 sin datos');
      }

    } catch {

      // 🆘 Yuki Wabot
      const res = await fetch(
        `https://api.yuki-wabot.my.id/dl/ytmp3v2?url=${encodeURIComponent(url)}&key=YukiBot-MD`
      );
      const json = await res.json();

      if (json.status && json.data?.dl) {
        title = json.data.fileName
          ? json.data.fileName.replace(/\.mp3$/i, '')
          : title;

        downloadUrl = json.data.dl;
      } else {
        throw new Error('Todas las APIs fallaron');
      }
    }
  }

  await sock.sendMessage(
    msg.chat,
    {
      audio: { url: downloadUrl },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
      ptt: false
    },
    { quoted: msg }
  );

  await msg.react('✅');

} catch (err) {
  console.error(err);
  await msg.react('❌');

  await sock.sendMessage(
    msg.chat,
    {
      text: '❌ Error al descargar el audio (todas las APIs fallaron).'
    },
    { quoted: msg }
  );
 }
  }
};

// 📌 Funciones compartidas
async function search(query, options = {}) {
  const search = await yts.search({ query, hl: 'es', gl: 'ES', ...options });
  return search.videos;
}

function secondString(seconds) {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % 3600) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const dDisplay = d > 0 ? d + (d == 1 ? ' día, ' : ' días, ') : '';
  const hDisplay = h > 0 ? h + (h == 1 ? ' hora, ' : ' horas, ') : '';
  const mDisplay = m > 0 ? m + (m == 1 ? ' minuto, ' : ' minutos, ') : '';
  const sDisplay = s > 0 ? s + (s == 1 ? ' segundo' : ' segundos') : '';
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
