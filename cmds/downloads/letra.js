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

      const url = `https://api.delirius.online/search/lyrics?query=${encodeURIComponent(query)}`;

      const res = await fetch(url);
      const json = await res.json();

      if (!res.ok || !json.status || !json.data) {
        await msg.react('❌');
        return msg.reply('❌ No se encontró la letra de esa canción.');
      }

      const { title, artists, album, duration, lyrics } = json.data;

      if (!lyrics) {
        await msg.react('❌');
        return msg.reply('❌ No se encontró la letra de esa canción.');
      }

      await msg.react('✅');

      const text =
        `*🎵 LETRA ENCONTRADA*\n\n` +
        `*📀 Título:* ${title || 'Desconocido'}\n` +
        `*🎤 Artista:* ${artists || 'Desconocido'}\n` +
        `*💿 Álbum:* ${album || 'Desconocido'}\n` +
        `*⏱️ Duración:* ${duration || 'Desconocida'}\n\n` +
        `${lyrics}`;

      await msg.reply(text);

    } catch (e) {
      console.error(e);
      await msg.react('❌');
      return msg.reply('❌ Ocurrió un error al buscar la letra de la canción.');
    }
  }
};
