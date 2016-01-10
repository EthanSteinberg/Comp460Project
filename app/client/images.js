// A mapping of image name to image source location.
const sources = {
  ship: 'ship.png',
};

/**
 * Load a single image.
 * Takes as input the url source and returns a Promise<Image>
 */
function loadImage(source) {
  const img = new Image();

  return new Promise((resolve) => {
    img.onload = () => {
      resolve(img);
    };
    img.src = '/static/' + source;
  });
}

/**
 * Load all the images in the image map.
 * Returns a promise for a mapping from image name to the Image objects.
 * See the `sources` map at the top of the file
 */
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
