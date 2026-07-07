import translate from '@vitalets/google-translate-api';
import fetch from 'node-fetch';

export default {
  command: ['translate', 'traducir', 'trad'],
  category: 'tools',
  description: '',
  run: async ({ msg, args, usedPrefix, command }) => {

    const usage = `👑 *Uso correcto del comando ${usedPrefix + command} (idioma) (texto)*

*Ejemplo:*
*${usedPrefix + command} es Hello*

*Conoce los idiomas admitidos en:*
*- https://cloud.google.com/translate/docs/languages*`;

    if (!args || !args[0]) {
      return msg.reply(usage);
    }

    let lang = args[0];
    let text = args.slice(1).join(' ');
    const defaultLang = 'es';

    if ((args[0] || '').length !== 2) {
      lang = defaultLang;
      text = args.join(' ');
    }

    if (!text && msg.quoted?.text) {
      text = msg.quoted.text;
    }

    try {
      await msg.react('🕗');

      const result = await translate(text, {
        to: lang,
        autoCorrect: true
      });

      await msg.reply('*Traducción:* ' + result.text);
      await msg.react('✅');

    } catch {

      try {
        await msg.react('🕗');

        const res = await fetch(
          `https://api.lolhuman.xyz/api/translate/auto/${lang}?apikey=${lolkeysapi}&text=${encodeURIComponent(text)}`
        );

        const json = await res.json();

        await msg.reply('*Traducción:* ' + json.result.translated);
        await msg.react('✅');

      } catch {

        await msg.reply('✨️ *Ocurrió Un Error*');

      }
    }
  },
};
