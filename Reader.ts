import TypeTable from './lib/TypeTable';

class Reader {
	data: Buffer;
	index: number = 0;
	bigEndian: boolean = true;
	constructor(data: Buffer) {
		this.data = data;
	}
	copy(data: Buffer, oldReader: Reader) {
		const newReader: Reader = Object.create(oldReader);
		Object.assign(newReader, oldReader);
		newReader.data = data;
		newReader.index = 0;
		return newReader;
	}
	readString() {
		let str = '';
		while(true) {
			const b = this.readByte();
			if(!b) {
				break;
			}
			str += String.fromCharCode(b);
		}
		return str;
	}
	readStringAt(value: number) {
		const isOffset = (value & 0x80000000) == 0;
		if(isOffset) {
			this.index = value;
			return this.readString();
		}
		const offset = value & 0x7FFFFFFF;
		return TypeTable[offset];
	}
	readByte() {
		return this.data.readUInt8(this.index++);
	}
	readInt16() {
		const b = this.bigEndian ? this.data.readInt16BE(this.index) : this.data.readInt16LE(this.index);
		this.index += 2;
		return b;
	}
	readUInt16() {
		const b = this.bigEndian ? this.data.readUInt16BE(this.index) : this.data.readUInt16LE(this.index);
		this.index += 2;
		return b;
	}
	readUInt32() {
		const b = this.bigEndian ? this.data.readUInt32BE(this.index) : this.data.readUInt32LE(this.index);
		this.index += 4;
		return b;
	}
	readInt32() {
		const b = this.bigEndian ? this.data.readInt32BE(this.index) : this.data.readInt32LE(this.index);
		this.index += 4;
		return b;
	}
	readInt64() {
		const b = this.bigEndian ? this.data.readBigInt64BE(this.index) : this.data.readBigInt64LE(this.index);
		this.index += 8;
		return b;
	}
	readUInt64() {
		const b = this.bigEndian ? this.data.readBigUInt64BE(this.index) : this.data.readBigUInt64LE(this.index);
		this.index += 8;
		return b;
	}
	readBoolean() {
		const b = this.readByte();
		return Boolean(b);
	}
	slice(length: number) {
		const data = this.data.slice(this.index, this.index + length);
		this.index += length;
		return this.copy(data, this);
	}
	align(alignment: number) {
		const pos = this.index;
		const mod = pos % alignment;
        if (mod != 0) {
            this.index += alignment - mod;
        }
	}
	readBytes(count: number) {
		const arr = [];
		for(var i=0;i<count;i++) {
			arr.push(this.readByte());
		}
		return Buffer.from(arr);
	}
	sliceFrom(offset: number, length: number) {
		const oldIndex = this.index;
		this.index = offset;
		const buffer = this.slice(length);
		this.index = oldIndex;
		return buffer;
	}
	insert(buffer: Buffer, position: number) {
		const oldIndex = this.index;
		this.index = 0;
		const start = this.slice(position).data;
		const end = this.slice(this.data.length - position).data;
		this.index = oldIndex + buffer.length;
		
		this.data = Buffer.concat([start, buffer, end]);
	}
}

export default Reader;