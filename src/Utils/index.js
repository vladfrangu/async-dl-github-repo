module.exports = {
	Directory: require("./Directory"),
	GetStream: require("./GetStream"),
	/**
	 * GitHub related things
	 */
	makeGitHubURL: repoInfo => `https://github.com/${repoInfo.owner}/${repoInfo.repo}/archive/${repoInfo.branch}.zip`,
	inputToRepoInfo: string => {
		let [owner, repo] = string.split("/");
		let branch = "master";

		if (repo && repo.includes("#")) {
			branch = repo.split("#")[1];
			repo = repo.split("#")[0];
		}

		return {
			owner,
			repo,
			branch,
		};
	},
	inputToURL: input => module.exports.makeGitHubURL(module.exports.inputToRepoInfo(input)),
	validateURL: url => {
		const [owner, repo, , branch] = url.replace("https://github.com/", "").trim().split("/");
		if (owner === "undefined" || repo === "undefined" || branch === "undefined") return false;
		return true;
	},
	/**
	 * MISC
	 */
	isZIP: input => {
		const buffer = input instanceof Uint8Array ? input : new Uint8Array(input);
		if (!(buffer && buffer.length > 1)) return null;

		const check = header => {
			for (let i = 0; i < header.length; i++) {
				if (header[i] !== buffer[i]) return false;
			}
			return true;
		};

		if (check([0x50, 0x4B]) &&
		(buffer[2] === 0x3 || buffer[2] === 0x5 || buffer[2] === 0x7) &&
		(buffer[3] === 0x4 || buffer[3] === 0x6 || buffer[3] === 0x8)) {
			return Promise.resolve({
				ext: "zip",
				mime: "application/zip",
			});
		}
		return Promise.reject(new Error(`Expected ZIP, but received other file type!`));
	},
};
