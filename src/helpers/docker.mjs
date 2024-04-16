import { readFileSync } from 'fs';
import { download, exists, extract, path, rm } from './fs.mjs';
import { join } from 'path';

let files = [];

export const getComposeFiles = () => {
	if (files.length) {
		return files;
	}

	const jsonFile = path('build/docker-compose-files.json');
	files = JSON.parse(readFileSync(jsonFile));
	return files;
}

export const parseVolume = (value) => {
	if (typeof value === 'object') {
		return value;
	}
	value = value.split(':');
	let [host, container] = value.length > 2
		? [value.slice(0, -1).join(':'), value[value.length - 1]]
		: value;

	if (host.startsWith('.') || (!host.startsWith('http') && host.match(/^[a-z0-9]/i))) {
		host = join(process.cwd(), host);
	}

 	return { host, container };
}

export const getExternalVolumeFiles = async (volumes, type) => {
	const tmpDir = path(`build/tmp/${type}`);
	const destination = path(`build/${type}`);

	const promises = volumes.map(async volume => {
		if (!volume.host.startsWith('http')) {
			return volume;
		}
		
		const url = volume.host;
		const fileName = url.split('/').pop();
		const tmpFile = `${tmpDir}/${fileName}`;
		const dirName = fileName.split('.').shift();
		const dest = `${destination}/${dirName}`;

		if (exists(dest)) {
			return {
				...volume,
				host: dest,
			}
		}

		const file = await download(url, tmpFile);

		await extract(file.path, destination);
		await rm(tmpFile);

		return {
			...volume,
			host: dest,
		}
	});
	
	return Promise.all(promises);
}