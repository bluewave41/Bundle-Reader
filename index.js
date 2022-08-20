import BundleReader from './BundleReader';
import SerializedReader from './SerializedReader';
import express from 'express';
import cors from 'cors';

const app = express();
const port = 5000;

app.use(express.json({ limit: '50mb' })) // To parse the incoming requests with JSON payloads
app.use(cors());

app.post('/extract', (req, res) => {
	if(!req.body.data) {
		res.status(400).write('Missing data parameter.');
		return res.end();
	}
	
	const data = Buffer.from(req.body.data);
	
	
	try {
		const bundleReader = new BundleReader(data);
		bundleReader.decompress();
		
		const reader = new SerializedReader(bundleReader.nodes[0].data);
		reader.process();
	
		const file = reader.getSingleAsset();
		
		res.status(200).write(file);
		res.end();
	}
	catch(e) {
		console.log(e);
		res.status(400).write('Something went wrong.');
		res.end();
	}
})

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})