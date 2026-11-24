import {
  Color,
  HalfFloatType,
  Mesh,
  NoBlending,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
  type Camera,
  type WebGLRenderer,
} from 'three';
import screenVertex from '@/shaders/backdrop.vert';
import resolveFragment from '@/shaders/resolve.frag';

interface Resolver {
  scene: Scene;
  camera: OrthographicCamera;
  material: ShaderMaterial;
}

let resolver: Resolver | null = null;
const previousClear = new Color();

function acquireResolver(): Resolver {
  if (resolver) return resolver;
  const material = new ShaderMaterial({
    vertexShader: screenVertex,
    fragmentShader: resolveFragment,
    uniforms: { uSource: { value: null } },
    depthTest: false,
    depthWrite: false,
    blending: NoBlending,
  });
  const quad = new Mesh(new PlaneGeometry(2, 2), material);
  quad.frustumCulled = false;
  const scene = new Scene();
  scene.add(quad);
  resolver = { scene, camera: new OrthographicCamera(-1, 1, 1, -1, 0, 1), material };
  return resolver;
}

export function renderSnapshot(gl: WebGLRenderer, scene: Scene, camera: Camera, width: number, height: number): HTMLCanvasElement {
  const beauty = new WebGLRenderTarget(width, height, { type: HalfFloatType, samples: 4 });
  const output = new WebGLRenderTarget(width, height, { depthBuffer: false });
  const resolve = acquireResolver();
  const previousTarget = gl.getRenderTarget();
  const previousAlpha = gl.getClearAlpha();
  const previousAutoClear = gl.autoClear;
  gl.getClearColor(previousClear);
  const pixels = new Uint8ClampedArray(width * height * 4);

  try {
    gl.autoClear = true;
    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(beauty);
    gl.render(scene, camera);
    resolve.material.uniforms.uSource.value = beauty.texture;
    gl.setRenderTarget(output);
    gl.render(resolve.scene, resolve.camera);
    gl.readRenderTargetPixels(output, 0, 0, width, height, pixels);
  } finally {
    resolve.material.uniforms.uSource.value = null;
    gl.setRenderTarget(previousTarget);
    gl.setClearColor(previousClear, previousAlpha);
    gl.autoClear = previousAutoClear;
    beauty.dispose();
    output.dispose();
  }

  const row = width * 4;
  const flipped = new Uint8ClampedArray(pixels.length);
  for (let y = 0; y < height; y++) flipped.set(pixels.subarray(y * row, (y + 1) * row), (height - 1 - y) * row);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.putImageData(new ImageData(flipped, width, height), 0, 0);
  return canvas;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('The canvas could not be encoded'))), type, quality);
  });
}
