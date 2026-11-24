import { studio } from '@/scene/studioBridge';

const CANDIDATE_TYPES = ['video/mp4;codecs=avc1.640028', 'video/webm;codecs=vp9', 'video/webm'] as const;
const FRAME_RATE = 60;
const BITS_PER_SECOND = 18_000_000;

export interface TurntableClip {
  blob: Blob;
  extension: 'mp4' | 'webm';
}

export function recordTurntable(seconds: number, onProgress: (progress: number) => void): Promise<TurntableClip> {
  const canvas = studio.gl?.domElement;
  const mimeType = typeof MediaRecorder === 'undefined' ? undefined : CANDIDATE_TYPES.find((type) => MediaRecorder.isTypeSupported(type));
  if (!canvas || !mimeType) return Promise.reject(new Error('Video recording is not supported in this browser'));

  return new Promise((resolve, reject) => {
    const stream = canvas.captureStream(FRAME_RATE);
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: BITS_PER_SECOND });
    const chunks: Blob[] = [];
    const turntable = { seconds, elapsed: 0 };

    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    });
    recorder.addEventListener('error', () => reject(new Error('The recorder stopped unexpectedly')));
    recorder.addEventListener('stop', () => {
      stream.getTracks().forEach((track) => track.stop());
      resolve({ blob: new Blob(chunks, { type: mimeType }), extension: mimeType.startsWith('video/mp4') ? 'mp4' : 'webm' });
    });

    const watch = () => {
      onProgress(Math.min(1, turntable.elapsed / seconds));
      if (turntable.elapsed < seconds) {
        requestAnimationFrame(watch);
        return;
      }
      studio.turntable = null;
      recorder.stop();
    };

    studio.turntable = turntable;
    recorder.start();
    requestAnimationFrame(watch);
  });
}
