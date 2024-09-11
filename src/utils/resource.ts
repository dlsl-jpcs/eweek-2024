import { LoadingManager } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";


export const SAILBOAT = "test.glb";
export const ICEBERG = "iceberg.glb";
export const ISLAND = "island.glb";
/*export const DOLPHIN = "dolphin.glb";*/
/*export const F22 = "low_poly_f22_raptor.glb";
export const TRICYCLE = "lowpoly_traysikeltricycle.glb";
export const MONOBLOC = "monobloc_-_plastic_garden_chair.glb";
export const GRASSLAND = "low_poly_style_-_grassland.glb";
export const LIGHTHOUSE = "low-poly_lighthouse.glb";
export const CLOUD = "low_poly_cloud.glb";*/

const MANAGER = new LoadingManager();
const ASSET_LOADER = new GLTFLoader(MANAGER);

const PRELOAD_ASSETS = [
    SAILBOAT,
    ICEBERG,
    ISLAND,
    /*DOLPHIN,*/
    /*CLOUD,
    LIGHTHOUSE,
    GRASSLAND,
    MONOBLOC,
    F22*/
];

const assets = new Map<string, GLTF>();
const onLoadCallbacks: (() => void)[] = [];



MANAGER.onStart = (url, loaded, total) => {
    console.log("STARTED: " + url + " " + loaded + " " + total);
}

MANAGER.onProgress = (url, loaded, total) => {
    console.log("PROGRESS: " + url + " " + loaded + " " + total)
}

MANAGER.onLoad = () => {
    onLoadCallbacks.forEach((callback) => callback());
}

MANAGER.onError = (url) => {
    console.error("ERROR: " + url);
}


export async function preloadAssets() {
    console.log("PRELOAD")
    const promises = [];

    for (const asset of PRELOAD_ASSETS) {
        const promise = ASSET_LOADER.loadAsync(asset).then((gltf) => {
            assets.set(asset, gltf);
        });

        promises.push(promise);
    }
}


export function getModel(name: string) {
    const asset = assets.get(name);
    if (!asset) {
        throw new Error(`Asset ${name} not found`);
    }

    return asset;
}

export function registerOnLoadCallback(callback: (() => void)) {
    onLoadCallbacks.push(callback);
}

export function registerOnProgressCallback(callback: ((url: string, loaded: number, total: number) => void)) {
    MANAGER.onProgress = callback;
}