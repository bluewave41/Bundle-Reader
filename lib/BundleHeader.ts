import BundleReader from '../BundleReader';

class BundleHeader {
	signature: string;
	version: number;
	unityVersion: string;
	unityRevision: string;
	size: bigint;
	compressedBlocksInfoSize: number;
	uncompressedBlocksInfoSize: number;
	flags: number;

	constructor(headerReader: BundleReader) {
		this.signature = headerReader.readString();
		this.version = headerReader.readUInt32();
		this.unityVersion = headerReader.readString();
		this.unityRevision = headerReader.readString();
		
		this.size = headerReader.readInt64();
		this.compressedBlocksInfoSize = headerReader.readUInt32();
		this.uncompressedBlocksInfoSize = headerReader.readUInt32();
		this.flags = headerReader.readUInt32();
	}
	getCompression() {
		return this.flags & 0x3f;
	}
}

export default BundleHeader;