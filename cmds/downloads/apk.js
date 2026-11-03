
import fetch from 'node-fetch';

export default {
  command: ['apk', 'apkdl', 'modapk'],
  category: 'downloads',
  description: 'Descarga aplicaciones APK',

  run: async ({ msg, sock, args }) => {
    if (!args[0]) {
      return msg.reply(
        '[ 🌟 ] Ingresa el nombre de la aplicación que quieres descargar.\nEjemplo:\n.apk simcity'
      );
    }

    const query = encodeURIComponent(args.join(' '));

    try {
      await msg.react('🕛');

      const res = await fetch(
        `https://api.delirius.online/download/apk?query=${query}`
      );

      if (!res.ok) throw new Error('La API no respondió');

      const json = await res.json();

      if (!json.status || !json.data) {
        throw new Error('Aplicación no encontrada');
      }

      const {
        name,
        size,
        image,
        download,
        developer,
        publish,
        id
      } = json.data;

      const texto = `❯───「 𝗔𝗣𝗞 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 」───❮
✦ 𝐍𝐨𝐦𝐛𝐫𝐞 : ⇢ ${name || 'Desconocido'} 📛
✦ 𝐓𝐚𝐦𝐚𝐧̃𝐨 : ⇢ ${size || 'Desconocido'} ⚖️
✦ 𝐃𝐞𝐬𝐚𝐫𝐫𝐨𝐥𝐥𝐚𝐝𝐨𝐫 : ⇢ ${developer || 'Desconocido'} 🛠️
✦ 𝐈𝐃 : ⇢ ${id || 'Desconocido'} 🆔
✦ 𝐅𝐞𝐜𝐡𝐚 : ⇢ ${publish || 'Desconocida'} 📅

⌛ Enviando aplicación...`;

      //=========================
      // 🖼️ INFORMACIÓN DEL APK
      //=========================
      if (image) {
        await sock.sendFile(
          msg.chat,
          image,
          `${name || 'app'}.jpg`,
          texto,
          msg
        );
      } else {
        await msg.reply(texto);
      }

      //=========================
      // 📦 DESCARGAR APK
      //=========================
      if (!download) {
        throw new Error('No se encontró el enlace de descarga');
      }

      await sock.sendMessage(
        msg.chat,
        {
          document: { url: download },
          mimetype: 'application/vnd.android.package-archive',
          fileName: `${name || 'app'}.apk`
        },
        { quoted: msg }
      );

      await msg.react('✅');

    } catch (e) {
      console.log('Error Delirius:', e.message);

      await msg.react('❌');

      return msg.reply(
        '❗ No se pudo encontrar o descargar la aplicación solicitada.'
      );
    }
  },
};
