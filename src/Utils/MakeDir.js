/**
 * https://github.com/sindresorhus/make-dir/blob/master/index.js
 */
const { dirname, resolve, parse } = require("path");
const fs = require("fs-nextra");
const defaults = {
	mode: 0o777 & ~process.umask(),
	fs,
};

const checkPath = pth => {
	if (process.platform === "win32") {
		const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(parse(pth).root, ""));

		if (pathHasInvalidWinCharacters) {
			const err = new Error(`Path contains invalid characters: ${pth}`);
			err.code = "EINVAL";
			throw err;
		}
	}
};

module.exports = (input, options) => Promise.resolve().then(() => {
	checkPath(input);
	options = Object.assign({}, defaults, options);

	const make = pth => fs.mkdir(pth, options.mode)
		.then(() => pth)
		.catch(err => {
			if (err.code === "ENOENT") {
				if (err.message.includes("null bytes") || dirname(pth) === pth) {
					throw err;
				}

				return make(dirname(pth)).then(() => make(pth));
			}

			return fs.stat(pth)
				.then(stats => stats.isDirectory() ? pth : Promise.reject())
				.catch(() => {
					throw err;
				});
		});
	return make(resolve(input));
});
