import { PerspectiveCamera, type Object3D } from 'three';
import { AMBIENCE_GROUP, studio } from '@/scene/studioBridge';
import { canvasToBlob, renderSnapshot } from './snapshot';

const LONG_EDGE = 3000;

export async function captureStill(): Promise<Blob> {
  const { gl, scene, camera } = studio;
  if (!gl || !scene || !(camera instanceof PerspectiveCamera)) throw new Error('The stage is not ready');

  const aspect = gl.domElement.width / gl.domElement.height;
  const width = Math.round(aspect >= 1 ? LONG_EDGE : LONG_EDGE * aspect);
  const height = Math.round(aspect >= 1 ? LONG_EDGE / aspect : LONG_EDGE);
  const shot = camera.clone();
  shot.clearViewOffset();
  shot.aspect = aspect;
  shot.updateProjectionMatrix();

  const hidden: Object3D[] = [];
  scene.traverse((object) => {
    if (object.name === AMBIENCE_GROUP && object.visible) hidden.push(object);
  });
  hidden.forEach((object) => (object.visible = false));
  try {
    return await canvasToBlob(renderSnapshot(gl, scene, shot, width, height), 'image/png');
  } finally {
    hidden.forEach((object) => (object.visible = true));
  }
}
