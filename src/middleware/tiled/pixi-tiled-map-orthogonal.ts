import type {
  RenderOrder,
  TiledMapOrthogonal,
  TiledProperty,
  TiledTileset,
} from 'tiled-types';

import { PixiTiledTileset } from './pixi-tiled-tile-set';
import { PixiTiledTileLayer } from './pixi-tiled-tile-layer';
import { PixiTiledCollisionLayer } from './pixi-tiled-collision-layer';
import { Container, ILoaderResource, Loader } from 'pixi.js';

export class PixiTiledMapOrthogonal extends Container {
  map: TiledMapOrthogonal;
  tilesets: PixiTiledTileset[];

  collisionLayer?: PixiTiledCollisionLayer;
  layers: any;

  public static middleware(resource: ILoaderResource, next: Function) {
    if (!resource.url.endsWith('tiled.json')) return next();
    const map: TiledMapOrthogonal = JSON.parse(resource.xhr.responseText);
    resource.data = map;
    next();
  }

  constructor(resourceId: string | number) {
    super();
    const resource = Loader.shared.resources[resourceId];
    const map: TiledMapOrthogonal = resource.data;
    this.map = map;
    this.setDataProperties(map);
    this.setDataTileSets(map);
    this.setDataLayers(map);
  }

  setDataProperties(map: TiledMapOrthogonal) {
    for (const property in map) {
      if (Object.prototype.hasOwnProperty.call(map, property)) {
        this[property] = map[property];
      }
    }
  }

  setDataTileSets(map: TiledMapOrthogonal) {
    this.tilesets = [];
    map.tilesets.forEach((tileSetData: TiledTileset) =>
      this.tilesets.push(new PixiTiledTileset(tileSetData)),
    );
  }

  setDataLayers(map: TiledMapOrthogonal) {
    map.layers.forEach((layerData) => {
      if (layerData.type === 'tilelayer') {
        this.setTileLayer(new PixiTiledTileLayer(layerData, this.tilesets));
        return;
      }
      this.layers[layerData.name] = layerData;
    });
  }

  setTileLayer(layerData: PixiTiledTileLayer) {
    if (layerData.name === 'collisions') {
      this.collisionLayer = new PixiTiledCollisionLayer(
        layerData,
        this.map.tilewidth,
        this.map.tileheight,
      );
      return;
    }

    this.layers[layerData.name] = layerData;
    this.addLayer(layerData);
  }

  addLayer(layer: PixiTiledTileLayer) {
    this.addChild(layer);
  }
}
