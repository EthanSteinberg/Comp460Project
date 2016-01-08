/**
 * @flow
 */

const sources = {
  ship: 'ship.png',
};

function loadImage(source) {
  const img = new Image();

  return new Promise((resolve) => {
    img.onload = () => {
      resolve(img);
    };
    img.src = '/static/' + source;
  });
}

export default function loadImages() {
  const imageNames = Object.keys(sources);
  const imageThings = imageNames.map((name) => loadImage(sources[name]));

  return Promise.all(imageThings).then(images => {
    const result = {};
    for (let i = 0; i < imageNames.length; i++) {
      result[imageNames[i]] = images[i];
    }

    return result;
  });
}
