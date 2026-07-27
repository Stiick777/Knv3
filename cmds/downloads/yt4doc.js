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
            // ==================================
      // API PRINCIPAL: FAA
      // ==================================
      try {

        const apiUrl =
          `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(url)}`;

        const res = await fetch(apiUrl);
        const json = await res.json();

        if (
          !json?.status ||
          !json?.result ||
          !json?.result?.download_url
        ) {
          throw new Error('FAA inválida');
        }

        title = 'video';
        quality = json.result.format || 'mp4';
        download_url = json.result.download_url;
        servidor = 'FAA';

      } catch (e1) {

        console.log('FAA falló, usando Yuki-Wabot...');

        // ==================================
        // RESPALDO 1: YUKI-WABOT
        // ==================================
        try {

          const apiUrl =
            `https://api.yuki-wabot.my.id/dl/ytmp4v2?url=${encodeURIComponent(url)}&key=YukiBot-MD`;

          const res = await fetch(apiUrl);
          const json = await res.json();

          if (
            !json?.status ||
            !json?.download ||
            !json?.download?.url
          ) {
            throw new Error('Yuki inválida');
          }

          title = json.data?.title || 'video';
          quality = `${json.download.quality}p`;
          download_url = json.download.url;
          servidor = 'Yuki-Wabot';

        } catch (e2) {

          console.log('Yuki-Wabot falló, usando AlyaCore...');

          // ==================================
          // RESPALDO 2: ALYACORE
          // ==================================
          try {

            const apiUrl =
              `https://api.alyacore.xyz/dl/ytmp4?url=${encodeURIComponent(url)}&quality=auto&key=LUFFY-FIX67`;

            const res = await fetch(apiUrl);
            const json = await res.json();

            if (
              !json?.status ||
              !json?.data ||
              !json?.data?.dl
            ) {
              throw new Error('AlyaCore inválida');
            }

            title = json.data.title || 'video';
            quality = json.data.quality || 'Auto';
            download_url = json.data.dl;
            servidor = 'AlyaCore';

          } catch (e3) {
            throw new Error('Todas las APIs fallaron');
          }
        }
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
