const maxSize = 10000;

export default class RenderList {
  constructor(pixelJson) {
    this.pixelJson = pixelJson;
    this.buffer = new Float32Array(9 * 6 * maxSize);
  }

  reset() {
    this.index = 0;
    this.transform = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }

  mmultiply(other) {
    const result = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    for (let row = 0; row < 3; row++) {
      for (let column = 0; column < 3; column++) {
        for (let i = 0; i < 3; i++) {
          result[row][column] += this.transform[row][i] * other[i][column];
        }
      }
    }

    this.transform = result;
  }

  translate(x, y) {
    this.mmultiply([
      [1, 0, x],
      [0, 1, y],
      [0, 0, 1],
    ]);
  }

  scale(scaleX, scaleY) {
    if (scaleY == null) {
      scaleY = scaleX;
    }
    this.mmultiply([
      [scaleX, 0, 0],
      [0, scaleY, 0],
      [0, 0, 1],
    ]);
  }

  rotate(radians) {
    this.mmultiply([
      [Math.cos(radians), -Math.sin(radians), 0],
      [Math.sin(radians), Math.cos(radians), 0],
      [0, 0, 1],
    ]);
  }

  strokeRect(name, size, x, y, width, height) {
    this.addImage(name, x - size / 2, y - size / 2, width + size, size);
    this.addImage(name, x - size / 2, y - size / 2 + height, width + size, size);

    this.addImage(name, x - size / 2, y - size / 2, size, height + size);
    this.addImage(name, x - size / 2 + width, y - size / 2, size, height + size);
  }

  renderText(text, startX, y, scale = 1) {
    if (scale !== 1) {
      this.scale(scale);
      this.renderText(text, startX / scale, y / scale);
      this.scale(1 / scale);
    } else {
      // const letterWidth = 19;
      const letterWidth = 14.5;

      for (let i = 0; i < text.length; i++) {
        const letter = text[i];
        const x = startX + letterWidth * i;

        const options = [
          ['abcdefghijklmnopqrstuvwxyz', 'pixel_love_lowercase'],
          ['abcdefghijklmnopqrstuvwxyz'.toUpperCase(), 'pixel_love_uppercase'],
          ['0123456789 .!?\'\"()*#$%^&,:', 'pixel_love_digits'],
        ];
        const image = options.find(a => a[0].indexOf(letter) !== -1);

        if (image == null) {
          continue;
        }
        const offset = image[0].indexOf(letter);
        this.addImage(image[1], x, y, letterWidth, null, offset * letterWidth, null, letterWidth, null);
      }
    }
  }

  addTransformedPoint(x, y) {
    const finalX = this.transform[0][0] * x + this.transform[0][1] * y + this.transform[0][2];
    const finalY = this.transform[1][0] * x + this.transform[1][1] * y + this.transform[1][2];

    this.buffer[this.index++] = finalX;
    this.buffer[this.index++] = finalY;
  }

  addCircleCutout(name, inRadians, x, y, width, height) {

    const radians = inRadians % (Math.PI * 2);

    const info = this.pixelJson[name];

    if (info == null) {
      console.error('Unable to find ', name);
      return;
    }

    width = (width || info.sizex);
    height = (height || info.sizey);

    this.offsets = [
      [1.0, 0.5],
      [1.0, 0.0],
      [0.5, 0.0],
      [0.0, 0.0],
      [0.0, 0.5],
      [0.0, 1.0],
      [0.5, 1.0],
      [1.0, 1.0],
      [1.0, 0.5],
    ];

    const index = Math.floor(radians / (Math.PI / 4)) + 1;

    for (let i = 0; i < index; i++) {
      this.addPoint(info, x, y, width, height, 0.5, 0.5);
      this.addPoint(info, x, y, width, height, this.offsets[i][0], this.offsets[i][1]);


      if (i === index - 1) {
        // Have to draw a partial traingle
        switch (index) {
          case 1:
            this.addPoint(info, x, y, width, height, 1.0, 0.5 - Math.tan(radians) * 0.5);
            break;
          case 2:
            this.addPoint(info, x, y, width, height, 0.5 + 0.5 / Math.tan(radians), 0.0);
            break;
          case 3:
            this.addPoint(info, x, y, width, height, 0.5 + 0.5 / Math.tan(radians), 0.0);
            break;
          case 4:
            this.addPoint(info, x, y, width, height, 0.0, 0.5 - Math.tan(Math.PI - radians) * 0.5);
            break;
          case 5:
            this.addPoint(info, x, y, width, height, 0.0, 0.5 + Math.tan(radians - Math.PI) * 0.5);
            break;
          case 6:
            this.addPoint(info, x, y, width, height, 0.5 + Math.tan(radians - 3 / 2 * Math.PI) * 0.5, 1.0);
            break;
          case 7:
            this.addPoint(info, x, y, width, height, 0.5 + Math.tan(radians - 3 / 2 * Math.PI) * 0.5, 1.0);
            break;
          case 8:
            this.addPoint(info, x, y, width, height, 1.0, 0.5 - Math.tan(radians) * 0.5);
            break;
          default:
            this.addPoint(info, x, y, width, height, this.offsets[i + 1][0], this.offsets[i + 1][1]);
        }
      } else {
        this.addPoint(info, x, y, width, height, this.offsets[i + 1][0], this.offsets[i + 1][1]);
      }
    }
  }

  addPoint(info, x, y, width, height, tX, tY) {
    const px = info.x;
    const psizex = info.sizex;

    const py = info.y;
    const psizey = info.sizey;

    this.addTransformedPoint(x + width * tX, y + height * tY);
    this.buffer[this.index++] = 0;

    this.buffer[this.index++] = px + psizex * tX;
    this.buffer[this.index++] = py + psizey * tY;

    this.buffer[this.index++] = px;
    this.buffer[this.index++] = py;
    this.buffer[this.index++] = psizex;
    this.buffer[this.index++] = psizey;
  }

  addImage(name, x, y, width, height, subX, subY, subWidth, subHeight) {
    const info = this.pixelJson[name];

    if (info == null) {
      console.error('Unable to find ', name);
      return;
    }

    width = (width || info.sizex);
    height = (height || info.sizey);

    const px = (subX || 0) + info.x;
    const psizex = subWidth || info.sizex;

    const py = (subY || 0) + info.y;
    const psizey = subHeight || info.sizey;

    this.addTransformedPoint(x, y + height);
    this.buffer[this.index++] = 0;

    this.buffer[this.index++] = px;
    this.buffer[this.index++] = py + psizey;

    this.buffer[this.index++] = px;
    this.buffer[this.index++] = py;
    this.buffer[this.index++] = psizex;
    this.buffer[this.index++] = psizey;

    this.addTransformedPoint(x + width, y);
    this.buffer[this.index++] = 0.0;

    this.buffer[this.index++] = px + psizex;
    this.buffer[this.index++] = py;

    this.buffer[this.index++] = px;
    this.buffer[this.index++] = py;
    this.buffer[this.index++] = psizex;
    this.buffer[this.index++] = psizey;

    this.addTransformedPoint(x + width, y + height);
    this.buffer[this.index++] = 0.0;

    this.buffer[this.index++] = px + psizex;
    this.buffer[this.index++] = py + psizey;

    this.buffer[this.index++] = px;
    this.buffer[this.index++] = py;
    this.buffer[this.index++] = psizex;
    this.buffer[this.index++] = psizey;


    this.addTransformedPoint(x, y + height);
    this.buffer[this.index++] = 0;

    this.buffer[this.index++] = px;
    this.buffer[this.index++] = py + psizey;

    this.buffer[this.index++] = px;
    this.buffer[this.index++] = py;
    this.buffer[this.index++] = psizex;
    this.buffer[this.index++] = psizey;


    this.addTransformedPoint(x + width, y);
    this.buffer[this.index++] = 0.0;

    this.buffer[this.index++] = px + psizex;
    this.buffer[this.index++] = py;

    this.buffer[this.index++] = px;
    this.buffer[this.index++] = py;
    this.buffer[this.index++] = psizex;
    this.buffer[this.index++] = psizey;

    this.addTransformedPoint(x, y);
    this.buffer[this.index++] = 0.0;

    this.buffer[this.index++] = px;
    this.buffer[this.index++] = py;

    this.buffer[this.index++] = px;
    this.buffer[this.index++] = py;
    this.buffer[this.index++] = psizex;
    this.buffer[this.index++] = psizey;
  }

  render(context) {
    context.bufferData(context.ARRAY_BUFFER, this.buffer.subarray(0, this.index), context.DYNAMIC_DRAW);
    context.drawArrays(context.TRIANGLES, 0, this.index / 9);
  }

}
