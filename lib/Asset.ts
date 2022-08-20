class Asset {
    version: number;
    name: string;
    size: number;

    constructor(version: number, name: string, size: number) {
        this.version = version;
        this.name = name;
        this.size = size;
    }
}

export default Asset;