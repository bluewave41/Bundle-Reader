import Reader from './Reader';
import SerializedHeader from './lib/SerializedHeader';
import SerializedType from './lib/SerializedType';
import TypeTree from './lib/TypeTree';
import TypeTreeNode from './lib/TypeTreeNode';
import AssetInfo from './lib/AssetInfo';
import LocalSerializedObjectIdentifier from './lib/LocalSerializedObjectIdentifier';
import FileIdentifier from './lib/FileIdentifier';
import Asset from './lib/Asset';

class SerializedReader extends Reader {
	header: SerializedHeader;
	types: SerializedType[] = [];
	assetsInfo: AssetInfo[] = [];
	scriptTypes: LocalSerializedObjectIdentifier[] = [];
	externals: FileIdentifier[] = [];

	constructor(data: Buffer) {
		super(data);
		this.header = this.readHeader();
	}
	process() {
		this.readTypes();
		this.readObjects();
		//reader.readScripts();
		//reader.readExternals();
	}
	getSingleAsset() {
		const assetInfo = this.assetsInfo.find(el => Number(el.pathId) != 1);

		if(!assetInfo) {
			return null;
		}
		const file = this.sliceFrom(assetInfo.byteStart!, assetInfo.byteSize!);
		
		const version = file.readUInt32();
		const str = file.readString();
		const size = file.readUInt32();
		
		const asset = new Asset(version, str, size);
		
		return file.slice(asset.size).data;
	}
	copy(data: Buffer): SerializedReader {
		return super.copy(data, this) as SerializedReader;
	}
	private readHeader() {
		const header = new SerializedHeader(this);
		return header;
	}
	readTypes() {
		const typeCount = this.readInt32();
		console.log(typeCount);
		for(var i=0;i<typeCount;i++) {
			this.types.push(this.readSerializedType(false));
			console.log(i)
		}
	}
	readSerializedType(isRefType: boolean) {
		const type = new SerializedType();
		
		type.classId = this.readInt32();
		type.isStrippedType = this.readBoolean();
		type.scriptTypeIndex = this.readInt16();
		
		if(isRefType && type.scriptTypeIndex >= 0) {
			type.scriptId = this.readBytes(16);
		}
		else if(type.classId == 114) {
			type.scriptId = this.readBytes(16);
		}
		type.oldTypeHash = this.readBytes(16);

		
		if(this.header.enableTypeTree) {
			type.type = new TypeTree();
			this.blobRead(type.type);
		}
		if(isRefType) {
			type.klassName = this.readString();
			type.nameSpace = this.readString();
			type.asmName = this.readString();
		}
		else {
			const length = this.readInt32();
			const typeDependencies = this.readBytes(length);
		}

		return type;
	}
	readObjects() {
		const objectCount = this.readInt32();
		for(var i=0;i<objectCount;i++) {
			const assetInfo = new AssetInfo();
			this.align(4);

			assetInfo.pathId = this.readInt64();
			assetInfo.byteStart = this.readUInt32();
			assetInfo.byteStart += this.header.dataOffset;
			assetInfo.byteSize = this.readUInt32();
			assetInfo.typeId = this.readInt32();

			const type = this.types[assetInfo.typeId];
			assetInfo.serializedType = type;
			assetInfo.classId = type.classId;

			this.assetsInfo.push(assetInfo);
		}
	}
	readScripts() {
		const scriptCount = this.readInt32();
		for(var i=0;i<scriptCount;i++) {
			const scriptType = new LocalSerializedObjectIdentifier();
			scriptType.localSerializedFileIndex = this.readInt32();
			
			this.align(4);
			
			scriptType.localIdentifierInFile = this.readInt32();

			this.scriptTypes.push(scriptType);
		}
	}
	readExternals() {
		const externalsCount  = this.readInt32();

		for(var i=0;i<externalsCount;i++) {
			const external = new FileIdentifier();
			this.readString(); //temp empty
			external.guid = this.readBytes(16);
			external.type = this.readInt32();
			external.pathName = this.readString();

			this.externals.push(external);
		}
	}
	blobRead(typeTree: TypeTree) {
		const nodeCount = this.readInt32();
		const stringBufferSize = this.readInt32();

		for(var i=0;i<nodeCount;i++) {
			const node = new TypeTreeNode();
			node.version = this.readUInt16();
			node.level = this.readByte();
			node.typeFlags = this.readByte();
			node.typeStrOffset = this.readUInt32();
			node.nameStrOffset = this.readUInt32();
			node.byteSize = this.readInt32();
			node.index = this.readInt32();
			node.metaFlag = this.readInt32();
			node.refTypeHash = this.readUInt64();
			typeTree.nodes.push(node);
		}
		
		typeTree.stringBuffer = this.copy(this.readBytes(stringBufferSize));

		for(var i=0;i<nodeCount;i++) {
			const node = typeTree.nodes[i];
			if(node.typeStrOffset) {
				node.type = typeTree.stringBuffer.readStringAt(node.typeStrOffset);
			}
			if(node.nameStrOffset) {
				node.name = typeTree.stringBuffer.readStringAt(node.nameStrOffset);
			}
		}
	}
}

export default SerializedReader;