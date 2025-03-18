const handler = async (m, { conn, text, usedPrefix, command }) => {  
    if (!text) return conn.reply(m.chat, `*💡 Uso Correcto: ${usedPrefix + command} gatos*`, m);  

    // Respuesta mientras se descarga la imagen  
    await m.react('📌');  

    try {  
        const res = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`);  
        const json = await res.json();  

        if (!json.status || !json.data.length) {  
            return conn.reply(m.chat, `❌ No encontré resultados para *${text}*`, m);  
        }  

        // Tomamos hasta 6 imágenes  
        const images = json.data.slice(0, 6);

        // Enviar todas las imágenes con su respectiva información
        await Promise.all(
            images.map(item => {
                const caption = `📍 *${item.grid_title || 'Imagen sin título'}*\n💎 *Creación:* ${item.created_at}`;
                return conn.sendFile(m.chat, item.images_url, 'image.jpg', caption, m);
            })
        );

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