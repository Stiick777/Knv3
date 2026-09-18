import { EventEmitter } from 'events';

let testerActivo = false;
let monitorInstalado = false;
const problemas = [];

const MAX_REGISTROS = 20;

function registrarProblema(data) {
    problemas.push({
        ...data,
        fecha: new Date().toLocaleString('es-CO')
    });

    if (problemas.length > MAX_REGISTROS) {
        problemas.shift();
    }
}

function instalarMonitor() {
    if (monitorInstalado) return;

    monitorInstalado = true;

    const originalOn = EventEmitter.prototype.on;
    const originalAddListener = EventEmitter.prototype.addListener;
    const originalOnce = EventEmitter.prototype.once;
    const originalPrependListener =
        EventEmitter.prototype.prependListener;

    const revisar = (emitter, event) => {
        if (!testerActivo) return;

        try {
            const cantidad = emitter.listenerCount(event);

            if (cantidad >= 10) {
                const nombre =
                    emitter.constructor?.name ||
                    'EventEmitter';

                registrarProblema({
                    tipo: 'LISTENERS',
                    evento: String(event),
                    cantidad,
                    objeto: nombre,
                    stack: new Error().stack
                });
            }
        } catch {}
    };

    EventEmitter.prototype.on = function (event, listener) {
        const result =
            originalOn.call(this, event, listener);

        revisar(this, event);

        return result;
    };

    EventEmitter.prototype.addListener = function (
        event,
        listener
    ) {
        const result =
            originalAddListener.call(
                this,
                event,
                listener
            );

        revisar(this, event);

        return result;
    };

    EventEmitter.prototype.once = function (
        event,
        listener
    ) {
        const result =
            originalOnce.call(
                this,
                event,
                listener
            );

        revisar(this, event);

        return result;
    };

    EventEmitter.prototype.prependListener =
        function (event, listener) {
            const result =
                originalPrependListener.call(
                    this,
                    event,
                    listener
                );

            revisar(this, event);

            return result;
        };

    process.on('warning', warning => {
        if (!testerActivo) return;

        registrarProblema({
            tipo: 'NODE WARNING',
            evento: warning.name,
            objeto: 'Node.js',
            mensaje: warning.message,
            stack: warning.stack
        });
    });
}

function obtenerStack(stack) {
    if (!stack) return 'Sin stack disponible';

    return stack
        .split('\n')
        .slice(1, 9)
        .join('\n');
}

export default {
    command: ['tester', 'test', 'debugger'],
    category: 'owner',
    description: 'Monitor global de EventEmitter',

    async run({ sock, msg, args }) {
        try {
            instalarMonitor();

            const accion =
                (args?.[0] || 'status').toLowerCase();

            if (
                accion === 'on' ||
                accion === 'start'
            ) {
                testerActivo = true;
                problemas.length = 0;

                return await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text:
`🧪 *TESTER GLOBAL*

Estado: 🟢 ACTIVADO

Ahora estoy monitoreando globalmente:

• WriteStream
• ReadStream
• Socket
• FFmpeg
• Baileys
• node-fetch
• Descargas
• Otros EventEmitter

⚠️ Detectaré objetos que lleguen a 10+ listeners.

Ahora reproduce el error.

Cuando aparezca el warning usa:

*.tester status*`
                    },
                    { quoted: msg }
                );
            }

            if (
                accion === 'off' ||
                accion === 'stop'
            ) {
                testerActivo = false;

                return await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text:
`🧪 *TESTER GLOBAL*

Estado: 🔴 DESACTIVADO`
                    },
                    { quoted: msg }
                );
            }

            if (
                accion === 'clear' ||
                accion === 'limpiar'
            ) {
                problemas.length = 0;

                return await sock.sendMessage(
                    msg.key.remoteJid,
                    {
                        text:
`🧹 *TESTER*

Registros eliminados correctamente.`
                    },
                    { quoted: msg }
                );
            }

            if (
                accion === 'status' ||
                accion === 'estado'
            ) {
                if (!testerActivo) {
                    return await sock.sendMessage(
                        msg.key.remoteJid,
                        {
                            text:
`🧪 *TESTER GLOBAL*

Estado: 🔴 DESACTIVADO

Usa:

.tester on`
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

Reproduce el error y vuelve a ejecutar:

.tester status`
                        },
                        { quoted: msg }
                    );
                }

                let texto =
`🧪 *TESTER GLOBAL*

Estado: 🟢 ACTIVO
Detectados: ${problemas.length}
`;

                const ultimos =
                    problemas.slice(-8);

                ultimos.forEach((p, i) => {
                    texto +=
`\n━━━━━━━━━━━━━━━━━━━━
🔴 *PROBLEMA ${i + 1}*
━━━━━━━━━━━━━━━━━━━━
`;

                    texto +=
`Tipo: ${p.tipo}\n`;

                    if (p.evento) {
                        texto +=
`Evento: ${p.evento}\n`;
                    }

                    if (p.cantidad) {
                        texto +=
`Listeners: ${p.cantidad}\n`;
                    }

                    texto +=
`Objeto: ${p.objeto}\n`;

                    if (p.mensaje) {
                        texto +=
`Mensaje: ${p.mensaje}\n`;
                    }

                    texto +=
`\n📍 *STACK:*\n${obtenerStack(p.stack)}\n`;
                });

                texto +=
`\n━━━━━━━━━━━━━━━━━━━━
Usa *.tester clear* para limpiar.`;

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

.tester on
→ Activar monitor

.tester status
→ Ver problemas

.tester clear
→ Limpiar registros

.tester off
→ Desactivar monitor`
                },
                { quoted: msg }
            );

        } catch (e) {
            return await sock.sendMessage(
                msg.key.remoteJid,
                {
                    text: `❌ Error: ${e.message}`
                },
                { quoted: msg }
            );
        }
    }
};
