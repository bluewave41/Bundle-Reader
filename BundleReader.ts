import Reader from './Reader';
import BundleHeader from './lib/BundleHeader';
import lz4 from 'lz4';
import Node from './lib/Node';
import Block from './lib/Block';

class BundleReader extends Reader {
	header: BundleHeader;
	hash: Buffer;
	blocks: Block[];
	nodes: Node[];

	constructor(data: Buffer) {
		super(data);
		this.header = this.readHeader();

		//decompressed is only useds for reading blocks and nodes so we don't need to save it
		const decompressed = this.getDecompressedData();

		this.hash  = decompressed.readBytes(16);
		this.blocks = decompressed.readBlocks();
		this.nodes = decompressed.readNodes();
	}
	decompress() {
		this.decompressBlocks();
		this.decompressNodes();
	}
	copy(data: Buffer): BundleReader {
		return super.copy(data, this) as BundleReader;
	}
	readHeader() {
		return new BundleHeader(this);
	}
	readBlocks() {
		const blocks: Block[] = [];
		const blockCount = this.readInt32();
		
		for(var i=0;i<blockCount;i++) {
			const uncompressedSize = this.readUInt32();
			const compressedSize = this.readUInt32();
			const flags = this.readUInt16();
			blocks.push(new Block(uncompressedSize, compressedSize, flags));
		}

		return blocks;
	}
	readNodes() {
		const nodes: Node[] = [];
		const nodeCount = this.readInt32();

		for(var i=0;i<nodeCount;i++) {
			const offset = this.readInt64();
			const size = this.readInt64();
			const flags = this.readUInt32();
			const path = this.readString();
			nodes.push(new Node(offset, size, flags, path));
		}

		return nodes;
	}
	getCompressedData() {
		this.align(16);
		return this.slice(this.header.compressedBlocksInfoSize);
	}
	getDecompressedData(): BundleReader {
		const compressed = this.getCompressedData().data;
		const decompressed = Buffer.alloc(this.header.uncompressedBlocksInfoSize);
		lz4.decodeBlock(compressed, decompressed);
		
		return this.copy(decompressed);
	}
	decompressBlocks() {
		for(const block of this.blocks) {
			const compression = block.getCompression();
			switch(compression) {
				case 1:
					const blockReader = this.slice(block.compressedSize);
					
					//these LZMA blocks are missing the end length segments which can be set to all 0xFF to specify unknown
					blockReader.insert(Buffer.from([0XFF, 0XFF, 0XFF, 0XFF, 0XFF, 0XFF, 0XFF, 0XFF]), 5);

					block.setData(blockReader);
				break;
				default:
					throw new Error('Not supported compression');
			}
		}
	}
	decompressNodes() {
		for(const node of this.nodes) {
			const reader = this.blocks[0].data;
			if(reader) {
				const slice = reader.sliceFrom(Number(node.offset), Number(node.size));
				node.setData(slice.data);
			}
		}
	}
}

export default BundleReader;