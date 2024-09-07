import { GLTF, GLTFLoader } from "three/examples/jsm/Addons.js";

export const SAILBOAT = "sailboat.glb";
export const ICEBERG = "iceberg.glb";
export const ISLAND = "island.glb";

const ASSET_LOADER = new GLTFLoader();

const PRELOAD_ASSETS = [
    SAILBOAT,
    ICEBERG,
    ISLAND
];

const assets = new Map<string, GLTF>();

export async function preloadAssets() {
    const promises = [];

    for (const asset of PRELOAD_ASSETS) {
        const path = "/eweek-2024/" + asset;
        const promise = ASSET_LOADER.loadAsync(path).then((gltf) => {
            assets.set(asset, gltf);
        });

        promises.push(promise);
    }

    await Promise.all(promises);
}


export function getModel(name: string) {
    const asset = assets.get(name);
    if (!asset) {
        throw new Error(`Asset ${name} not found`);
    }

    return asset;
}