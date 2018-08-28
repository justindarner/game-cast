const Buffer = require('safe-buffer').Buffer;
const Transform = require('stream').Transform;
/**
 * Emit data every number of bytes
 * @extends Transform
 */
class TagLengthValue extends Transform {
  constructor(options) {
    super(options);
    this.position = 0;
    this.header = Buffer.alloc(2);
    this.value = undefined;
    this.parsingHeader = true;
    this.length = 0;
    this.message = {
      value: Buffer.alloc(0),
      length: 0,
    };
  }
  _transform(chunk, encoding, cb) {
    let cursor = 0;
    while (this.parsingHeader && cursor < chunk.length) {
      this.header[this.position] = chunk[cursor];
      cursor++;
      this.position++;
      if (this.position === 2) {
        this.parsingHeader = false;
        this.length = this.header[1];
        this.value = Buffer.alloc(this.length);
        this.position = 0;
      }
    }

    while (!this.parsingHeader && cursor < chunk.length) {
      this.value[this.position] = chunk[cursor];
      cursor++;
      this.position++;
      if (this.position === this.length) {
        const length = this.header[1] + 2;
        this.message = {
          value: Buffer.concat([this.header, this.value], length),
          length,
        };
        this.push(this.message.value);
        this.parsingHeader = true;
        this.length = 0;
        this.header = Buffer.alloc(2);
        this.value = undefined;
      }
    }
    cb();
  }
  _flush(cb) {
    this.push(this.message.value.slice(0, this.position));
    this.message.value = Buffer.alloc(0);
    cb();
  }
}
module.exports = TagLengthValue;
