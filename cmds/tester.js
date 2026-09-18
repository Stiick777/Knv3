import { EventEmitter } from 'events';

let testerActivo = false;
let instalado = false;

const problemas = [];
const MAX_PROBLEMAS = 20;

let originalOn;
let originalAddListener;
let originalOnce;
let originalPrependListener;

function guardarProblema(data) {
    problemas.push({
        ...data,
        fecha: new Date().toLocaleString('es-CO')
    });

    if (problemas.length > MAX_PROBLEMAS) {
        problemas.shift();
    }
}

function instalarMonitor() {
    if (instalado) return;

    instalado = true;

    originalOn = EventEmitter.prototype.on;
    originalAddListener = EventEmitter.prototype.addListener;
    originalOnce = EventEmitter.prototype.once;
    originalPrependListener = EventEmitter.prototype.prependListener;

    function revisar(emitter, event) {
        if (!testerActivo) return;

        try {
            const cantidad = emitter.listenerCount(event);

            if (cantidad >= 10) {
                const nombre = emitter.constructor?.name || 'EventEmitter';

                guardarProblema({
                    tipo: 'LISTENERS',
                    evento: String(event),
                    cantidad,
                    objeto: nombre,
                    stack: new Error().stack
                });
            }
        } catch {}
    }

    EventEmitter.prototype.on = function (event, listener) {
        const result = originalOn.call(this, event, listener);

        revisar(this, event);

        return result;
    };

    EventEmitter.prototype.addListener = function (event, listener) {
        const result = originalAddListener.call(this, event, listener);

        revisar(this, event);

        return result;
    };

    EventEmitter.prototype.once = function (event, listener) {
        const result = originalOnce.call(this, event, listener);

        revisar(this, event);

        return result;
    };

    EventEmitter.prototype.prependListener = function (event, listener) {
        const result = originalPrependListener.call(this, event, listener);

        revisar(this, event);

        return result;
    };

    process.on('warning', warning => {
        if (!testerActivo) return;

        guardarProblema({
            tipo: 'NODE WARNING',
            evento: warning.name,
            cantidad: null,
            objeto: 'Node.js',
            mensaje: warning.message,
            stack: warning.stack
        });
    });
}

function formatearProblema(p, index) {
    let texto = `\n━━━━━━━━━━━━━━━━━━━━\n`;
    texto += `🔴 #${index + 1} ${p.tipo}\n`;
    texto += `━━━━━━━━━━━━━━━━━━━━\n`;

    if (p.evento) {
        texto += `Evento: ${p.evento}\n`;
    }

    if (p.cantidad) {
        texto += `Listeners: ${p.cantidad}\n`;
    }

    texto += `Objeto: ${p.objeto}\n`;

    if (p.mensaje) {
        texto += `Mensaje: ${p.mensaje}\n`;
    }

    if (p.stack) {
        const stack = p.stack
            .split('\n')
            .slice(1, 8)
            .join('\n');

        texto += `\n📍 Stack:\n${stack}\n`;
    }

    return texto;
}

export default {
    name: 'tester',
    aliases: ['test', 'debugger'],

    async execute(sock, msg, args) {
        try {
            instalarMonitor();

            const accion = (args[0] || 'status').toLowerCase();

            if (accion === 'on' || accion === 'start') {
                testerActivo = true;

                problemas.length = 0;

                return await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text:
`🧪 *TESTER GLOBAL ACTIVADO*

Ahora estoy monitoreando globalmente los EventEmitter de Node.js.

📡 Detectaré:
• WriteStream
• ReadStream
• Socket
• Baileys
• FFmpeg
• Descargas
• Otros EventEmitter

⚠️ También detectaré cuando algún objeto llegue a 10+ listeners.

Ahora reproduce el problema:
• .play
• .play2
• .sticker
• descargas
• cualquier comando que genere el warning

Después usa:
*.tester status*`
                    },
                    { quoted: msg }
                );
            }

            if (accion === 'off' || accion === 'stop') {
                testerActivo = false;

                return await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: '🛑 *TESTER DESACTIVADO*'
                    },
                    { quoted: msg }
                );
            }

            if (accion === 'clear' || accion === 'limpiar') {
                problemas.length = 0;

                return await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: '🧹 *TESTER LIMPIADO*\n\nSe borraron todos los registros.'
                    },
                    { quoted: msg }
                );
            }

            if (accion === 'status' || accion === 'estado') {

                if (!testerActivo) {
                    return await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text:
`🧪 *TESTER GLOBAL*

Estado: 🔴 DESACTIVADO

Usa:
*.tester on*

para comenzar el monitoreo.`
                        },
                        { quoted: msg }
                    );
                }

                if (!problemas.length) {
                    return await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text:
`🧪 *TESTER GLOBAL*

Estado: 🟢 ACTIVO

No se han detectado problemas todavía.

Ejecuta tus comandos normalmente y vuelve a usar:
*.tester status*`
                        },
                        { quoted: msg }
                    );
                }

                let texto =
`🧪 *TESTER GLOBAL*

Estado: 🟢 ACTIVO
Problemas detectados: ${problemas.length}
`;

                problemas.slice(-10).forEach((p, i) => {
                    texto += formatearProblema(
                        p,
                        i
                    );
                });

                texto += `\n━━━━━━━━━━━━━━━━━━━━\n`;
                texto += `Usa *.tester clear* para limpiar.`;

                return await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text: texto
                    },
                    { quoted: msg }
                );
            }

            return await sock.sendMessage(
                msg.key.remoteJid,
                {
                    text:
`🧪 *TESTER GLOBAL*

Comandos:

*.tester on*
Activa el monitor.

*.tester status*
Muestra los problemas.

*.tester clear*
Limpia los registros.

*.tester off*
Desactiva el monitor.`
                },
                { quoted: msg }
            );

        } catch (e) {
            await sock.sendMessage(
                msg.key.remoteJid,
                {
                    text: `❌ Error: ${e.message}`
                },
                { quoted: msg }
            );
        }
    }
};
