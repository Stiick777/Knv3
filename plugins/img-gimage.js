import fg from 'senna-fg';

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

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    if (!text) throw `✳️ ${mssg.example}: *${usedPrefix + command}* Billie Eilish`;

    // Convertir el texto a minúsculas y buscar si contiene alguna palabra prohibida
    let lowerText = text.toLowerCase();
    let forbiddenWord = prohibited.find(word => lowerText.includes(word));

    if (forbiddenWord) {
        return conn.reply(m.chat, `🚫 La búsqueda contiene la palabra prohibida: *${forbiddenWord}* _pajin_`, m);
    }

    try {
        let res = await fg.googleImage(text);
        conn.sendFile(m.chat, res.getRandom(), 'img.png', `✅ ${mssg.result}`.trim(), m);
    } catch (error) {
        conn.reply(m.chat, `⚠️ No se pudo obtener la imagen. Inténtalo con otra búsqueda.`, m);
    }
};

handler.help = ['imagen'];
handler.tags = ['img'];
handler.command = /^(img|image|gimage|imagen)$/i;
handler.diamond = true;

export default handler;