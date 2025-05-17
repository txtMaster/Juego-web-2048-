export default class SoundPool {
  constructor(
    audioBuffer,
    audioContext = new window.AudioContext(),
    poolSize = 10
  ) {
    this.audioContext = audioContext;
    this.audioBuffer = audioBuffer;
    this.poolSize = poolSize;
    this.pool = [];
    this.index = 0;

    this._createPool();
  }

  _createPool() {
    for (let i = 0; i < this.poolSize; i++) {
      this.pool.push(this._createSource());
    }
  }

  _createSource() {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;

    // Cada uno se conecta directamente al destino (o puedes enrutarlo a efectos)
    const gainNode = this.audioContext.createGain();
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    return { source, gainNode, inUse: false };
  }

  play(volume = 1.0) {
    const current = this.pool[this.index];

    // Los nodos no se pueden reutilizar, así que creamos uno nuevo cada vez que se usa
    const newSource = this.audioContext.createBufferSource();
    newSource.buffer = this.audioBuffer;

    newSource.connect(current.gainNode);
    current.gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);

    newSource.start();

    // Reemplaza el nodo en el pool
    this.pool[this.index] = {
      source: newSource,
      gainNode: current.gainNode,
      inUse: true,
    };

    // Mueve al siguiente nodo en el pool (circular)
    this.index = (this.index + 1) % this.poolSize;
  }
}
