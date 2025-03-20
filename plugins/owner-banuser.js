var handler = async (m, { conn, text, args, usedPrefix, command }) => {  
    const ownerNumber = '5216645011701'; // Reemplázalo con tu número sin @s.whatsapp.net

    if (m.sender.replace(/@s\.whatsapp\.net$/, '') !== ownerNumber) {
        return conn.reply(m.chat, '⚠️ *No tienes permisos para usar este comando.*', m);
    }

    let user, number, bot, owner, aa, users;  

    try {  
        function no(number) {  
            return number.replace(/\s/g, '').replace(/([@+-])/g, '');  
        }  

        let reason = args.slice(1).join(' ') || 'Spam';  

        if (!args[0] && !m.quoted && !m.mentionedJid) {  
            return conn.reply(m.chat, `💡 *Proporcione un número, mencione a alguien o responda a un mensaje.*\n\nEjemplo:\n- *${usedPrefix}${command} @usuario razón*\n- *${usedPrefix}${command} +573222356632 razón*`, m);  
        }  

        number = args[0] ? no(args[0]) : null;  

        if (args[0] && !isNaN(number)) {  
            user = number + '@s.whatsapp.net';  
        } else if (m.quoted && m.quoted.sender) {  
            user = m.quoted.sender;  
        } else if (m.mentionedJid && m.mentionedJid[0]) {  
            user = m.mentionedJid[0];  
        }  

        if (!user) {  
            return conn.reply(m.chat, `❎ *No se pudo determinar el usuario.*`, m);  
        }  

        bot = conn.user.jid.split`@`[0];  
        if (user === conn.user.jid) {  
            return conn.reply(m.chat, `✴️ @${bot} *No puede ser baneado con este comando.*`, m, { mentions: [user] });  
        }  

        users = global.db.data.users;  

        if (!users[user]) {  
            return conn.reply(m.chat, `🍁 *El usuario no está registrado en la base de datos.*`, m);  
        }  

        if (users[user].banned === true) {  
            return conn.reply(m.chat, `⚡ *El usuario ya está baneado.*`, m, { mentions: [user] });  
        }  

        users[user].banned = true;  
        users[user].bannedReason = reason;  

        await conn.reply(m.chat, `✅ *Usuario baneado con éxito.*\n\n💌 *Razón:* ${reason}`, m, { mentions: [user] });  
    } catch (e) {  
        console.error(e);  
        await conn.reply(m.chat, '❌ *Ocurrió un error inesperado.*', m);  
    }  
};  

handler.help = ['banuser <@tag|número> <razón>'];  
handler.command = ['banuser'];  
handler.tags = ['owner'];  
handler.rowner = true;  

export default handler;
