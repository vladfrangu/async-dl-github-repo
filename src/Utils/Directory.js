const MODE = 0o777 & ~process.umask();

const {
	/**
	 * Strip Directory
	 */
	posix,
	win32,
	normalize,
	sep,
	join,
	/**
	 * MakeDirectory
	 */
	parse,
	dirname,
	resolve,
} = require("path");

const {
	mkdir,
	stat,
} = require("fs-nextra");

const isNaturalNumber = number => Number.isSafeInteger(number) && number >= 1;

exports.stripDirectory = (pathStr, count) => {
	if (typeof pathStr !== "string") throw new Error(`"${pathStr}" is not a string!`);
	if (posix.isAbsolute(pathStr) || win32.isAbsolute(pathStr)) throw new Error(`"${pathStr}" is an absolute path! We require relative paths`);
	if (!isNaturalNumber(count)) throw new Error(`The count parameter is not a number! We need a number greater than or equal to 0.`);

	const pathComponents = normalize(pathStr).split(sep);
	if (pathComponents.length > 1 && pathComponents[0] === ".")	pathComponents.shift();

	if (count > pathComponents.length - 1) throw new RangeError("Cannot strip more directories than there are.");

	// eslint-disable-next-line prefer-spread
	return join.apply(null, pathComponents.slice(count));
};

const checkPath = path => {
	if (process.platform === "win32") {
		const invalidChars = /[<>:"|?*]/.test(path.replace(parse(path).root, ""));
		if (invalidChars) {
			const err = new Error(`Path has invalid characters for Windows: ${path}`);
			err.code = "EINVAL";
			return Promise.reject(err);
		}
	}
	return Promise.resolve();
};

exports.makeDir = async input => {
	await checkPath(input);

	const make = path => mkdir(path, MODE)
		.then(() => path)
		.catch(err => {
			if (err.code === "ENOENT") {
				if (err.message.includes("null bytes") || dirname(path) === path) {
					throw err;
				}
				return make(dirname(path)).then(() => make(path));
			}

			return stat(path)
				.then(stats => stats.isDirectory() ? path : Promise.reject(new Error(`The given path is not a directory!`)))
				.catch(() => {
					throw err;
				});
		});
	return make(resolve(input));
};
