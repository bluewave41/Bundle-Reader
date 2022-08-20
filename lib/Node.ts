class Node {
	offset: bigint;
	size: bigint;
	flags: number;
	path: string;
	data: Buffer|null = null;

	constructor(offset: bigint, size: bigint, flags: number, path: string) {
		this.offset = offset;
		this.size = size;
		this.flags = flags;
		this.path = path;
	}
	setData(data: Buffer) {
		this.data = data;
	}
}

export default Node;