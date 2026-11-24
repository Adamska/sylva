import { buildSpecimen, type GrowthInputs, type SpecimenData } from './meshBuilder';
import { transferables } from './meshData';

export interface BuildRequest {
  id: number;
  inputs: GrowthInputs;
}

export interface BuildResponse {
  id: number;
  data: SpecimenData;
}

self.addEventListener('message', (event: MessageEvent<BuildRequest>) => {
  const data = buildSpecimen(event.data.inputs);
  const response: BuildResponse = { id: event.data.id, data };
  self.postMessage(response, { transfer: transferables(data.bark, data.foliage) });
});
