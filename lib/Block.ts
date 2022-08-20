const lzma = require('lzma');
import Reader from '../Reader';

class Block {
	uncompressedSize: number;
	compressedSize: number;
	flags: number;
	data: Reader|null;

	constructor(uncompressedSize: number, compressedSize: number, flags: number) {
		this.uncompressedSize = uncompressedSize;
		this.compressedSize = compressedSize;
		this.flags = flags;
		this.data = null;
	}
	//synchronous
	setData(reader: Reader) {
		const compression = this.getCompression();
		switch(compression) {
			case 1:
				reader.data = Buffer.from(lzma.decompress(reader.data));
				this.data = reader;
			break;
		}
	}
	getCompression() {
		return this.flags & 0x3f;
	}
}

export default Block;