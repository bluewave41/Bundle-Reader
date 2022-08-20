import TypeTree from './TypeTree';

class SerializedType {
    classId?: number;
    isStrippedType?: boolean;
    scriptTypeIndex?: number;
    type?: TypeTree;
    scriptId?: Buffer;
    oldTypeHash?: Buffer;
    typeDependencies?: number[];
    klassName?: string;
    nameSpace?: string;
    asmName?: string;

    constructor() {}
}

export default SerializedType;