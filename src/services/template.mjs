import { Edge } from 'edge.js'
import { writeFileSync } from 'fs';

import { createDir, path } from '../helpers/fs.mjs';

export const render = async (template, options = {}) => {
	const edge = Edge.create();
	edge.mount(path('templates'));
	options.root = path();
	return edge.render(template, options);
}

export const renderAndSave = async (template, file, options = {}, project = false) => {
	const content = await render(template, options);
	return await save(file, content, project);
}

export const save = async (file, content, project = false) => {
	file = !project ? path('build/' + file) : file;

	const folders = file.split('/').slice(0, -1);
	createDir(folders.join('/'));

	writeFileSync(file, content);

	return file;
}