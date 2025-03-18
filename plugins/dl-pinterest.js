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
        const images = json.data.slice(0, 6).map(item => item.images_url);

        // Enviar todas las imágenes juntas
        await conn.sendMessage(m.chat, { 
            image: { url: images[0] }, 
            caption: `📍 Resultado de: *${text}*`, 
            contextInfo: { 
                externalAdReply: { 
                    mediaUrl: images[1], 
                    mediaType: 1, 
                    thumbnailUrl: images[2], 
                    title: "KanBot V2", 
                    body: "Aquí están tus imágenes", 
                    previewType: 0 
                } 
            } 
        });

        // Enviar las demás imágenes
        await Promise.all(images.slice(1).map(url => conn.sendFile(m.chat, url, 'image.jpg', '', m)));

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