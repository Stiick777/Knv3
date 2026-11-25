
import { proto } from 'baileys';

const FIELD = 26;
const TAG = (FIELD << 3) | 2;
const PATCHED = Symbol.for('kanbot.soundSticker.patched');

const pendingAudio = new Map();

const hashKey = hash => Buffer.from(hash).toString('base64');

export function attachAudio(hash, audioBytes) {
  if (!hash) throw new Error('El sticker no contiene fileSha256');
  pendingAudio.set(hashKey(hash), audioBytes);
}

export function detachAudio(hash) {
  if (hash) pendingAudio.delete(hashKey(hash));
}

export function installStickerAudioPatch() {
  const StickerMessage = proto.Message.StickerMessage;

  if (StickerMessage.encode[PATCHED]) return;

  const originalEncode = StickerMessage.encode;

  const patchedEncode = function (message, writer) {
    const result = originalEncode.call(this, message, writer);

    if (message?.fileSha256) {
      const audio = pendingAudio.get(hashKey(message.fileSha256));

      if (audio) {
        result.uint32(TAG).bytes(audio);
      }
    }

    return result;
  };

  patchedEncode[PATCHED] = true;
  StickerMessage.encode = patchedEncode;
}

export function createAudioMessage(audio, seconds, waveform) {
  return proto.Message.AudioMessage.encode(
    proto.Message.AudioMessage.create({
      url: audio.url,
      mimetype: 'audio/ogg; codecs=opus',
      fileSha256: audio.fileSha256,
      fileLength: audio.fileLength,
      seconds,
      ptt: true,
      mediaKey: audio.mediaKey,
      fileEncSha256: audio.fileEncSha256,
      directPath: audio.directPath,
      mediaKeyTimestamp: audio.mediaKeyTimestamp ||
        Math.floor(Date.now() / 1000),
      waveform
    })
  ).finish();
}
