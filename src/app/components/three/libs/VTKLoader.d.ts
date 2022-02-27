export class VTKLoader extends Loader {
    constructor(manager: any);
    load(url: any, onLoad: any, onProgress: any, onError: any): void;
    parse(data: any): BufferGeometry;
}
import { Loader } from "three/src/loaders/Loader";
import { BufferGeometry } from "three/src/core/BufferGeometry";
