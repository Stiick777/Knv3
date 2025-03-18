const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*💡 Uso Correcto: ${usedPrefix + command} gatos*`, m);

    // Lista de palabras prohibidas
    const prohibited = ['hentai', 'porno', 'xxx', 'nopor', 'rule34', 'sex']; // Puedes seguir tu lista

    if (prohibited.some(word => text.toLowerCase().includes(word))) {
        return conn.reply(m.chat, `⚠️ *No puedo buscar eso.*`, m);
    }

    await m.react('📌');

    try {
        const res = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`);
        const json = await res.json();

        if (!json.status || !json.data.length) {
            return conn.reply(m.chat, `❌ No encontré resultados para *${text}*`, m);
        }

        const images = json.data.slice(0, 6);
        
        for (const item of images) {
            await conn.sendMessage(m.chat, { 
                image: { url: item.images_url }, 
                caption: `📍 ${item.grid_title || 'Imagen sin título'}\n💎 *Creado:* ${item.created_at}`
            });
        }

        await m.react('✅');

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `❌ Error al buscar imágenes. Inténtalo de nuevo.`, m);
    }
};

handler.help = ['pinterest <query>'];
handler.tags = ['dl'];
handler.command = ['pinterest', 'pin', 'pimg'];
handler.group = true;
export default handler;