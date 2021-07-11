import { Rectangle, Texture } from 'pixi.js';

import type { TiledTileset } from 'tiled-types';

export class PixiTiledTileset {
  //TODO type?
  baseTexture: any;
  textures: Texture[];
  tileset: TiledTileset;

  constructor(tileset: TiledTileset) {
    this.tileset = tileset;
    this.setTileSetProperties(tileset);
    this.baseTexture = Texture.from(tileset.image);
    this.setTileTextures();
  }

  setTileSetProperties(tileset: TiledTileset) {
    for (const property in tileset) {
      if (Object.prototype.hasOwnProperty.call(tileset, property)) {
        this[property] = tileset[property];
      }
    }
  }

  setTileTextures() {
    this.textures = [];
    for (
      let y = this.tileset.margin;
      y < this.tileset.imageheight;
      y += this.tileset.tileheight + this.tileset.spacing
    ) {
      for (
        let x = this.tileset.margin;
        x < this.tileset.imagewidth;
        x += this.tileset.tilewidth + this.tileset.spacing
      ) {
        const tileRectangle = new Rectangle(
          x,
          y,
          this.tileset.tilewidth,
          this.tileset.tileheight,
        );
        new Texture(this.baseTexture, tileRectangle);
        this.textures.push(new Texture(this.baseTexture, tileRectangle));
      }
    }
  }
}
