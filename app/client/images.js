// A mapping of image name to image source location.
const sources = {
  ship: 'ship.png',
  mine: 'mine.png',
  shipyard: 'shipyard.png',
  money: 'money.png',
  shipskeleton: 'shipskeleton.png',
  roundshot: 'roundshot.png',
  chainshot: 'chainshot.png',
  grapeshot: 'grapeshot.png',
  shell: 'shell.png',
  cancelshot: 'cancelshot.png',
  gunboat: 'gunboat.png',
  frigate: 'frigate.png',
  galleon: 'galleon.png',
  template: 'template.png',
  stats: 'stats.png',
  info: 'info.png',
  exit: 'exit.png',
  smoke: 'smoke.png',
  cannon: 'cannon.png',
  designer: 'designer.png',
  targettoggleHull: 'targettoggleHull.png',
  targettoggleCannon: 'targettoggleCannon.png',
  blueFlag: 'blueFlag.png',
  redFlag: 'redFlag.png',
  save: 'save.png',
  grayBack: 'grayBack.png',
  splashscreen: 'splashscreen.png',
  notready: 'notready.png',
  ready: 'ready.png',
  piratesTag: 'piratesTag.png',
  imperialsTag: 'imperialsTag.png',
  westindies: 'westindies.png',
  tropics: 'tropics.png',
  greatlakes: 'greatlakes.png',
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
