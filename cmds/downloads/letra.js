import fetch from 'node-fetch';

export default {
  command: ['lyrics', 'letra'],
  category: 'search',
  description: 'Busca la letra de una canción',

  run: async ({ msg, args }) => {
    try {
      const query = args.join(' ').trim();

      if (!query) {
        return msg.reply(
          `*✦ Ingresa el nombre de una canción.*\n\n` +
          `*Ejemplo:*\n` +
          `.lyrics Bohemian Rhapsody`
        );
      }

      await msg.react('🕓');

      const apiKey = 'yosoyyo_sk_vdri1g4p';
      const url = `https://yosoyyo-api-ofc.onrender.com/api/lyrics?q=${encodeURIComponent(query)}&apiKey=${apiKey}`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || json.status !== 200 || !json.result) {
        await msg.react('❌');
        return msg.reply('❌ No se encontró la letra de esa canción.');
      }

      const { title, artist, lyrics } = json.result;

      await msg.react('✅');

      const text = `*🎵 LETRA ENCONTRADA*\n\n` +
        `*📀 Título:* ${title}\n` +
        `*🎤 Artista:* ${artist}\n\n` +
        `${lyrics}`;

      await msg.reply(text);

    } catch (e) {
      console.error(e);
      await msg.react('❌');
      msg.reply('❌ Ocurrió un error al buscar la letra de la canción.');
    }
  }
};
