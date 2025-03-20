import axios from 'axios'
import * as cheerio from 'cheerio'

let handler = async (m, { text }) => {
    if (!text) throw '✳️ Debes ingresar un término de búsqueda para Wikipedia.' 

    try {
        const link = await axios.get(`https://es.wikipedia.org/wiki/${text}`)
        const $ = cheerio.load(link.data)
        let wik = $('#firstHeading').text().trim()
        let resulw = $('#mw-content-text > div.mw-parser-output').find('p').text().trim()

        m.reply(`▢ *Wikipedia*\n\n‣ ${resulw}`)
    } catch (e) {
        m.reply('⚠️ No se encontró información en Wikipedia.')
    }
}

handler.help = ['wikipedia']
handler.tags = ['search']
handler.command = ['wiki', 'wikipedia'] 

export default handler
