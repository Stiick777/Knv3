import fs from 'fs';
import axios from 'axios';
import path from 'path';

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
        return conn.reply(m.chat, `⚠️ *No daré resultado a tu solicitud* - Palabra prohibida: ${foundProhibitedWord}`, m);
    }

    await m.react('📌'); // Reacción de espera

    try {
        const res = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`);
        const json = await res.json();

        if (!json.status || !json.data.length) {
            return conn.reply(m.chat, `❌ No encontré resultados para *${text}*`, m);
        }

        // Seleccionar hasta 6 imágenes
        const images = json.data.slice(0, 6);

        // Carpeta temporal para almacenar las imágenes
        const tempFolder = './temp/';
        if (!fs.existsSync(tempFolder)) fs.mkdirSync(tempFolder);

        let filePaths = [];

        // Descargar imágenes y guardarlas temporalmente
        for (let i = 0; i < images.length; i++) {
            const imageUrl = images[i].images_url;
            const fileName = `image_${i}.jpg`;
            const filePath = path.join(tempFolder, fileName);
            filePaths.push(filePath);

            const response = await axios({
                url: imageUrl,
                responseType: 'arraybuffer'
            });

            fs.writeFileSync(filePath, response.data);
        }

        // Enviar todas las imágenes en un solo mensaje
        await conn.sendMessage(m.chat, {
            document: filePaths.map(fp => ({
                url: fp
            })),
            mimetype: 'image/jpeg',
            fileName: 'imagenes.zip',
            caption: `🔎 *Resultados para:* ${text}`
        }, { quoted: m });

        // Eliminar imágenes después de enviarlas
        filePaths.forEach(fp => fs.unlinkSync(fp));

        await m.react('✅'); // Reacción de éxito

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