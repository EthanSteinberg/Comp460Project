const audioContext = new AudioContext();

export function createSource(buffer) {
  const source = audioContext.createBufferSource();
  source.buffer = buffer;
  source.connect(audioContext.destination);
  return source;
}

export function loadBuffer(url) {
  return new Promise(resolve => {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';
    request.onload = () => {
      const audioData = request.response;
      audioContext.decodeAudioData(audioData, buffer => resolve(buffer));
    };
    request.send();
  });
}
