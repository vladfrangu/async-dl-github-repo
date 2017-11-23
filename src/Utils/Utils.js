const { posix, win32, join, normalize, sep } = require("path");

exports.makeGitHubURL = repoInfo => `https://github.com/${repoInfo.owner}/${repoInfo.repo}/archive/${repoInfo.branch}.zip`;

exports.inputToRepoInfo = string => {
	let [owner, repo] = string.split("/");
	let branch = "master";

	if (repo.includes("#")) {
		branch = repo.split("#")[1];
		repo = repo.split("#")[0];
	}

	return {
		owner,
		repo,
		branch,
	};
};

exports.inputToURL = input => exports.makeGitHubURL(exports.inputToRepoInfo(input));
exports.validateURL = url => {
	const [owner, repo, , branch] = url.replace("https://github.com/", "").trim().split("/");
	if ((owner || repo || branch) === "null") return false;
	return true;
};

exports.isNaturalNumber = (val, includeZero = false) => {
	if (includeZero && val === 0) return true;
	return Number.isSafeInteger(val) && val >= 1;
};

exports.stripDirectory = (pathStr, count) => {
	if (typeof pathStr !== "string") throw new Error(`"${pathStr}" is not a string!`);
	if (posix.isAbsolute(pathStr) || win32.isAbsolute(pathStr)) throw new Error(`"${pathStr}" is an absolute path! We require relative paths`);
	if (!exports.isNaturalNumber(count, true)) throw new Error(`The count parameter is not a number! We need a number greater than or equal to 0.`);

	const pathComponents = normalize(pathStr).split(sep);
	if (pathComponents.length > 1 && pathComponents[0] === ".") {
		pathComponents.shift();
	}

	if (count > pathComponents.length - 1) throw new RangeError("Cannot strip more directories than there are.");

	// eslint-disable-next-line prefer-spread
	return join.apply(null, pathComponents.slice(count));
};
