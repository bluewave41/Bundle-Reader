import TypeTreeNode from './TypeTreeNode';
import Reader from '../Reader';

class TypeTree {
	nodes: TypeTreeNode[] = [];
	stringBuffer: Reader|null = null;

	constructor() {}
}

export default TypeTree;