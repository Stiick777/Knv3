import fetch from 'node-fetch';

export default {
  command: ['ytmp4doc', 'yt4doc'],
  category: 'downloads',
  description: '',
  run: async ({ msg, sock, args }) => {

    if (!args?.[0]) {
      return msg.reply(
        '💣 _*Ingresa el enlace del video de YouTube junto al comando.*_\n\n`Ejemplo:`\n> *!ytmp4doc* https://youtube.com/watch?v=qHDJSRlNhVs'
      );
    }

    if (!args[0].match(/youtu/gi)) {
      await msg.react('✖️');
      return msg.reply(
        '❌ Verifica que el enlace sea de YouTube.'
      );
    }

    await msg.react('🕓');

    try {

      const url = args[0];

      let title;
      let quality;
      let download_url;
      let servidor;

      // ==================================
      // API PRINCIPAL: DELIRIUS
      // ==================================
      try {

        const apiUrl = `https://api.delirius.store/download/ytmp4?url=${encodeURIComponent(url)}&format=360p`;

        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json?.status || !json?.data?.download) {
          throw new Error('Delirius inválida');
        }

        title = json.data.title || 'video';
        quality = json.data.format || '360p';
        download_url = json.data.download;
        servidor = 'Delirius';

      } catch (e) {

        console.log('Delirius falló, usando ZennzXD...');

        // ==================================
        // API RESPALDO: ZENNZXD
        // ==================================
        const apiUrl = `https://api.zenzxz.my.id/download/youtube?url=${encodeURIComponent(url)}&format=360`;

        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json?.status || !json?.result?.download) {
          throw new Error('ZennzXD inválida');
        }

        title = json.result.title || 'video';
        quality = `${json.result.format}p`;
        download_url = json.result.download;
        servidor = 'ZennzXD';

      }

      // ==================================
      // MENSAJE DE ESPERA
      // ==================================
      let txt = '`🅓🅞🅒🅢 🅥➋ - 🅚🅐🅝🅑🅞🅣`\n\n';
      txt += `🍁 *Título:* ${title}\n`;
      txt += `🎞️ *Calidad:* ${quality}\n`;
      txt += `🌐 *Servidor:* ${servidor}\n\n`;
      txt += `> *Se está enviando su video, por favor espere*`;

      await msg.reply(txt);

      // ==================================
      // ENVIAR COMO DOCUMENTO
      // ==================================
      await sock.sendMessage(
        msg.chat,
        {
          document: {
            url: download_url
          },
          mimetype: 'video/mp4',
          fileName: `${title}.mp4`,
          caption: '🌝 *Provided by KanBot* 🌚'
        },
        {
          quoted: msg
        }
      );

      await msg.react('✅');

    } catch (e) {

      console.error('Error descarga:', e);

      await msg.react('✖️');

      return msg.reply(
        '❌ _*No se pudo descargar el video desde ningún servidor.*_'
      );

    }
  },
};
