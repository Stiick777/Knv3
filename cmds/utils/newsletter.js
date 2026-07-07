export default {
  command: ['newsletter'],
  category: 'tools',
  description: '',
  run: async ({ msg, sock, args }) => {

    if (!args[0]) {
      return msg.reply(
        'Ingresa el enlace del canal.\n\nEjemplo:\n.newsletter https://whatsapp.com/channel/0029VaXXXXXXXXXXXX'
      );
    }

    const match = args[0].match(/whatsapp\.com\/channel\/([A-Za-z0-9]+)/i);

    if (!match) {
      return msg.reply('Enlace de canal inválido.');
    }

    try {
      const invite = match[1];

      const res = await sock.newsletterMetadata("invite", invite);

      await msg.reply(
`📢 *Información del Canal*

🆔 ID:
${res.id}

📛 Nombre:
${res.name}

👤 Seguidores:
${res.subscribers}

📅 Creado:
${new Date(res.creation_time * 1000).toLocaleString()}

✍️ Descripción:
${res.description || 'Sin descripción'}`
      );

    } catch (e) {
      console.error(e);
      await msg.reply('No pude obtener la información del canal.');
    }

  },
};
