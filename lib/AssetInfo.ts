import SerializedType from "./SerializedType";

class AssetInfo {
    byteStart?: number;
    byteSize?: number;
    typeId?: number;
    classId?: number;
    isDestroyed?: number;
    stripped?: number;

    pathId?: bigint;
    serializedType?: SerializedType;

    constructor() {}
}

export default AssetInfo;