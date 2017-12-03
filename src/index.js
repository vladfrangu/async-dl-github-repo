const Package = require("../package");
const {
	inputToRepoInfo,
	inputToURL,
	validateURL,
} = require("./Utils/");
const decompress = require("./Decompress/");
const { get } = require("snekfetch");
const { join } = require("path");
const { writeFileAtomic } = require("fs-nextra");

/**
 * Async-dl-github-repo
 * @extends Promise
 */
class AsyncDlGitHubRepo {
	constructor (repo, destination, downloadOnly) {
		this.repo = repo;
		this.destination = destination;
		this.downloadOnly = downloadOnly;
	}

	then (resolver, rejecter) {
		if (this._result && (this._result.zipPath || this._result.finalPath)) return Promise.resolve(this._result);
		return new Promise((resolve, reject) => {
			if (!(this.repo || this.path)) {
				reject(new Error(`You are missing either the repo or the destination!`));
			}
			const INFO = inputToRepoInfo(this.repo), URL = inputToURL(this.repo);
			const FINAL_PATH = join(process.cwd(), this.destination);
			if (!validateURL(URL)) return reject(new Error(`"${this.repo}" is invalid. Please ensure you typed it right`));
			this._result = {
				zipPath: null,
				finalPath: null,
			};
			get(URL).then(async ({ body: buffer }) => {
				if (this.downloadOnly) {
					const TEMP_PATH = join(FINAL_PATH, `${INFO.owner}-${INFO.repo}#${INFO.branch}.zip`);
					await writeFileAtomic(TEMP_PATH, buffer);
					this._result.zipPath = TEMP_PATH;
					return resolve(this._result);
				}
				await decompress(buffer, FINAL_PATH);
				this._result.finalPath = FINAL_PATH;
				return resolve(this._result);
			}).catch(err => {
				if (err.status === 404) return reject(new Error(`"${INFO.owner}/${INFO.repo}#${INFO.branch}" is not a valid repository / branch combo`));
				else return reject(new Error(`Failed to get information from GitHub! Received status code ${err.status}`));
			});
		}).then(resolver, rejecter);
	}

	catch (rejecter) {
		return this.then(null, rejecter);
	}

	end (cb) {
		return this.then(
			result => cb ? cb(null, result) : result,
			err => cb ? (err, null) : Promise.reject(err),
		);
	}
}

AsyncDlGitHubRepo.version = Package.version;
module.exports.version = Package.version;

/**
 * @typedef {Object} DownloadReturn The results of the download
 * @param {?String} [zipPath] The zip path, if you only downloaded a zip archive
 * @param {?String} [finalPath] The path where the results were extracted
 */

/**
 * Download a GitHub repo
 * @param {String} repo The repository in format "Username/Project[#branch]"
 * @param {String} destination Path to where the files should be saved
 * @param {Boolean} [downloadOnly=false] If only the ZIP archive should be saved
 */
module.exports = (repo, destination, downloadOnly = false) => new AsyncDlGitHubRepo(repo, destination, downloadOnly);
