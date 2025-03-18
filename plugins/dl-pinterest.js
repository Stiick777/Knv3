import fs from 'fs';
import path from 'path';
import axios from 'axios';

const handler = async (m, { conn, text, usedPrefix, command }) => {  
    if (!text) return conn.reply(m.chat, `*💡 Uso Correcto: ${usedPrefix + command} gatos*`, m);  

    // Lista de palabras prohibidas  
    const prohibited = [  
        'se men', 'hen tai', 'se xo', 'te tas', 'cu lo', 'c ulo', 'cul o',  
        'ntr', 'rule34', 'rule', 'caca', 'polla', 'femjoy', 'porno',  
        'porn', 'gore', 'onlyfans', 'sofiaramirez01', 'kareli', 'karely',  
        'cum', 'semen', 'nopor', 'puta', 'puto', 'culo', 'putita', 'putito',  
        'pussy', 'hentai', 'pene', 'coño', 'asesinato', 'zoofilia',  
        'mia khalifa', 'desnudo', 'desnuda', 'cuca', 'chocha', 'muertos',  
        'pornhub', 'xnxx', 'xvideos', 'teta', 'vagina', 'marsha may',  
        'misha cross', 'sexmex', 'furry', 'furro', 'furra', 'xxx',  
        'rule34', 'panocha', 'pedofilia', 'necrofilia', 'pinga',  
        'horny', 'ass', 'nude', 'popo', 'nsfw', 'femdom', 'futanari',  
        'erofeet', 'sexo', 'sex', 'yuri', 'ero', 'ecchi', 'blowjob',  
        'anal', 'ahegao', 'pija', 'verga', 'trasero', 'violation',  
        'violacion', 'bdsm', 'cachonda', '+18', 'cp', 'mia marin',  
        'lana rhoades', 'porn', 'cepesito', 'hot', 'buceta', 'xxx', 'nalga',  
        'nalgas'  
    ];  

    // Verificación de palabras prohibidas  
    const foundProhibitedWord = prohibited.find(word => text.toLowerCase().includes(word));  
    if (foundProhibitedWord) {  
        return conn.reply(m.chat, `⚠️ *No daré resultado a tu solicitud por pajin* - Palabra prohibida: ${foundProhibitedWord}`, m);  
    }  

    // Respuesta mientras se descargan las imágenes  
    await m.react('📌');  

    try {  
        const res = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`);  
        const json = await res.json();  

        if (!json.status || !json.data.length) {  
            return conn.reply(m.chat, `❌ No encontré resultados para *${text}*`, m);  
        }  

        // Tomamos hasta 6 imágenes
        const images = json.data.slice(0, 6).map(item => ({
            url: item.images_url,
            caption: `📍 ${item.grid_title || 'Imagen sin título'}\n💎 *Create:* ${item.created_at}`
        }));

        // Directorio temporal para guardar imágenes
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        // Descargar y guardar imágenes
        const savedImages = [];
        for (let i = 0; i < images.length; i++) {
            const response = await axios({
                url: images[i].url,
                responseType: 'arraybuffer'
            });

            const filePath = path.join(tempDir, `image_${i}.jpg`);
            fs.writeFileSync(filePath, response.data);
            savedImages.push(filePath);
        }

        // Enviar todas las imágenes en un solo mensaje
        await conn.sendMessage(m.chat, { 
            caption: `🔎 *Resultados de ${text}*`,
            image: savedImages.map(filePath => fs.readFileSync(filePath))
        }, { quoted: m });

        // Eliminar archivos temporales
        savedImages.forEach(filePath => fs.unlinkSync(filePath));

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