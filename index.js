import fs from 'fs';
import BundleReader from './BundleReader';
import SerializedReader from './SerializedReader';
import Asset from './lib/Asset';
import 'source-map-support/register';

const data = fs.readFileSync('chart.bundle');

const bundleReader = new BundleReader(data);
bundleReader.decompress();

const reader = new SerializedReader(bundleReader.nodes[0].data);
reader.process();

console.log(reader.getSingleAsset());