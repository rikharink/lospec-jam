import { Container, Texture } from 'pixi.js';
import { PixiTiledTile } from './pixi-tiled-tile';
import type { TiledLayerTilelayer, TiledTileset } from 'tiled-types';
import { PixiTiledTileset } from './pixi-tiled-tile-set';

export class PixiTiledTileLayer extends Container {
  tilelayer: TiledLayerTilelayer;
  tiles: PixiTiledTile[];

  constructor(layer: TiledLayerTilelayer, tilesets: PixiTiledTileset[]) {
    super();
    this.tilelayer = layer;
    this.setProperties(layer);
    this.alpha = layer.opacity;
    this.setLayerTiles(layer, tilesets);
  }

  private setProperties(tileData: TiledLayerTilelayer) {
    for (const property in tileData) {
      if (Object.prototype.hasOwnProperty.call(tileData, property)) {
        this[property] = tileData[property];
      }
    }
  }

  setLayerTiles(layer: TiledLayerTilelayer, tilesets: PixiTiledTileset[]) {
    this.tiles = [];
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const i = x + y * layer.width;
        if (this.tileExists(i)) {
          const tileData = { i, x, y };
          const tile = this.createTile(tilesets, tileData);

          this.tiles.push(tile);
          this.addTile(tile);
        }
      }
    }
  }

  createTile(
    tilesets: PixiTiledTileset[],
    tileData: { i: number; x: number; y: number },
  ) {
    const { i, x, y } = tileData;
    const tileset = this.findTileSet(this.tilelayer[i], tilesets);
    let dat = this.tilelayer.data as number[];
    let tileIndex = dat?.[i] - 1 ?? 0;
    const tile = new PixiTiledTile(tileIndex, tileset);

    tile.x = x * tileset.tileset.tilewidth;
    tile.y =
      y * tileset.tileset.tileheight +
      (tileset.tileset.tileheight - (<Texture>tile.textures[0]).height);

    tile._x =
      x + (tileset.tileset.tileoffset ? tileset.tileset.tileoffset.x : 0);
    tile._y =
      y + (tileset.tileset.tileoffset ? tileset.tileset.tileoffset.y : 0);

    if (tile.textures.length > 1 && tile.tile) {
      tile.animationSpeed = 1000 / 60 / tile.tile.animation[0].duration;
      tile.gotoAndPlay(0);
    }
    return tile;
  }

  tileExists(i: number) {
    return this.tilelayer.data[i] !== 0;
  }

  addTile(tile: PixiTiledTile) {
    this.addChild(tile);
  }

  findTileSet(id: number, tilesets: PixiTiledTileset[]): PixiTiledTileset {
    let tileset: PixiTiledTileset;
    for (let i = tilesets.length - 1; i >= 0; i--) {
      tileset = tilesets[i];
      if (tileset.tileset.firstgid <= id) {
        break;
      }
    }
    return tileset;
  }
}
