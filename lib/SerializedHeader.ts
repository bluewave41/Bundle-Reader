import SerializedReader from "../SerializedReader";

class SerializedHeader {
	metadataSize: number;
	fileSize: number;
	version: number;
	dataOffset: number;
	endianess: boolean;
	reserved: Buffer;
	unityVersion: string;
	targetPlatform: number;
	enableTypeTree: boolean;

	constructor(serializedReader: SerializedReader) {
		this.metadataSize = serializedReader.readUInt32();
		this.fileSize = serializedReader.readUInt32();
		this.version = serializedReader.readUInt32();
		this.dataOffset = serializedReader.readUInt32();
		this.endianess = serializedReader.readBoolean();
		this.reserved = serializedReader.readBytes(3);
		
		if(!this.endianess) {
			serializedReader.bigEndian = false;
		}

		this.unityVersion = serializedReader.readString();
		this.targetPlatform = serializedReader.readInt32();
		this.enableTypeTree = serializedReader.readBoolean();
	}
}

export default SerializedHeader;