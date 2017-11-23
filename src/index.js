const { join } = require("path");
const { writeFileAtomic } = require("fs-nextra");
const request = require("snekfetch");
const { inputToURL, inputToRepoInfo, validateURL } = require("./Utils/Utils.js");
const extract = require("./Decompress/Decompress");

/**
 * @typedef {Object} DownloadReturn The results of the download
 * @param {?String} [zipPath] The zip path, if you only downloaded a zip archive
 * @param {?String} [finalPath] The path where the results were extracted
 */

/**
 * Download a GitHub repo
 * @param {String} repo The repository in format "Username/Project[#branch]"
 * @param {String} destination Path to where the files should be saved
 * @param {Boolean} [downloadOnly=false] Other options to pass to the extraction.
 */
module.exports = async (repo, destination, downloadOnly = false) => {
	const info = inputToRepoInfo(repo);
	const URL = inputToURL(repo);
	if (!validateURL(URL)) throw new Error(`"${repo}" is invalid. Please ensure you typed it right`);

	const finalPath = join(process.cwd(), destination);
	const tempPath = join(finalPath, `${info.owner}-${info.repo}#${info.branch}.zip`);
	let obj = { zipPath: null, finalPath: null };

	const { body: buffer } = await request.get(URL);

	if (downloadOnly) {
		await writeFileAtomic(tempPath, buffer);
		obj.zipPath = tempPath;
		return obj;
	}
	await extract(buffer, finalPath, { strip: 1 });
	obj.finalPath = finalPath;

	return obj;
};
