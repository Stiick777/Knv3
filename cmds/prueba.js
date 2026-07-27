export default {
  command: ['diagjid', 'diagnosticojid'],
  category: 'owner',
  description: 'Diagnóstico de JID y Baileys',
  isOwner: true,

  run: async ({ msg, sock }) => {
    try {
      const onWhatsApp = await sock.onWhatsApp(msg.sender).catch(e => ({
        error: e.message
      }));

      const info = `
📋 *Diagnóstico*

*Sender:*
${msg.sender}

*Chat:*
${msg.chat}

*RemoteJid:*
${msg.key.remoteJid}

*Participant:*
${msg.key.participant || 'No tiene'}

*PushName:*
${msg.pushName}

*FromMe:*
${msg.fromMe}

*isGroup:*
${msg.isGroup}

*ID del mensaje:*
${msg.key.id}

*Sock User:*
${JSON.stringify(sock.user, null, 2)}

*onWhatsApp():*
${JSON.stringify(onWhatsApp, null, 2)}
`;

      await msg.reply(info);
    } catch (e) {
      await msg.reply(`Error:\n${e.stack}`);
    }
  }
};
