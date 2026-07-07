import fetch from 'node-fetch';

export default {
  command: ['ia', 'chatgpt'],
  category: 'ai',
  description: '',
  run: async ({ msg, text, usedPrefix, command }) => {
    if (!text) {
      return msg.reply(
        `💡 *Ingrese su petición*\n⚡ *Ejemplo de uso:* ${usedPrefix + command} Hola, ¿cómo estás?`
      );
    }

    try {
      await msg.react('💭');

      const response = await fetch(
        `https://api.delirius.store/ia/chatgpt?q=${encodeURIComponent(text)}`
      );

      const data = await response.json();

      if (data.status && data.data) {
        await msg.reply(
          `*KanBot según ChatGPT:*\n\n${data.data}`
        );
      } else {
        await msg.react('❌');

        await msg.reply(
          '❌ Error: No se obtuvo una respuesta válida.'
        );
      }

    } catch (error) {
      await msg.react('❌');

      console.error('❌ Error al obtener la respuesta:', error);

      await msg.reply(
        'Error: intenta más tarde.'
      );
    }
  },
};
