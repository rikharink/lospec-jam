import type { TiledTile } from 'tiled-types';
import { PixiTiledTileset } from './pixi-tiled-tile-set';
import { AnimatedSprite, DEG_TO_RAD, Texture } from 'pixi.js';

const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

export class PixiTiledTile extends AnimatedSprite {
  tileset: PixiTiledTileset;
  tile?: TiledTile;

  constructor(tileId: number, tileset: PixiTiledTileset) {
    let horizontalFlip = !!(tileId & FLIPPED_HORIZONTALLY_FLAG);
    let verticalFlip = !!(tileId & FLIPPED_VERTICALLY_FLAG);
    let diagonalFlip = !!(tileId & FLIPPED_DIAGONALLY_FLAG);

    tileId &= ~(
      FLIPPED_HORIZONTALLY_FLAG |
      FLIPPED_VERTICALLY_FLAG |
      FLIPPED_DIAGONALLY_FLAG
    );

    let tile = tileset.tileset.tiles?.[tileId];
    const textures = setTextures(tileId, tileset, tile);
    super(textures);
    this.tile = tile;
    this.textures = textures;
    this.tileset = tileset;

    this.setFlips(horizontalFlip, verticalFlip, diagonalFlip);
  }

  _x: number;
  _y: number;

  setFlips(
    horizontalFlip: boolean,
    verticalFlip: boolean,
    diagonalFlip: boolean,
  ) {
    if (horizontalFlip) this.setHorizontalFlip();
    if (verticalFlip) this.setVerticalFlip();
    if (diagonalFlip) {
      if (horizontalFlip) this.setHorizontalDiagonalFlip();
      if (verticalFlip) this.setVerticalDiagonalFlip();
    }
  }

  setHorizontalFlip() {
    this.anchor.x = 1;
    this.scale.x = -1;
  }

  setVerticalFlip() {
    this.anchor.y = 1;
    this.scale.y = -1;
  }

  setHorizontalDiagonalFlip() {
    this.anchor.x = 0;
    this.scale.x = 1;
    this.anchor.y = 1;
    this.scale.y = 1;

    this.rotation = DEG_TO_RAD * 90;
  }

  setVerticalDiagonalFlip() {
    this.anchor.x = 1;
    this.scale.x = 1;
    this.anchor.y = 0;
    this.scale.y = 1;

    this.rotation = DEG_TO_RAD * -90;
  }
}

function setTextures(
  id: number,
  tileset: PixiTiledTileset,
  tile?: TiledTile,
): Texture[] {
  const textures: Texture[] = [];
  if (tile?.animation?.length > 0) {
    tile.animation.forEach((frame) =>
      textures.push(tileset.textures[frame.tileid]),
    );
  }
  textures.push(tileset.textures[id]);
  return textures;
}

function setBitNumber(n: number) {
  if (n == 0) return 0;

  let msb = 0;
  n = n / 2;

  while (n != 0) {
    n = n / 2;
    msb++;
  }

  return 1 << msb;
}
