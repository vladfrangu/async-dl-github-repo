const { dirname, join } = require("path");
const { utimes, link, symlink, writeFile, readFile } = require("fs-nextra");
const decompressZip = require("./DecompressZip");
const makeDir = require("../Utils/MakeDir");
const { stripDirectory } = require("../Utils/Utils");

const runPlugins = (input, options) => {
	if (options.plugins.length === 0) return Promise.resolve([]);
	return Promise.all(options.plugins.map(x => x(input, options))).then(files => files.reduce((a, b) => a.concat(b)));
};

const extractFile = (input, output, options) => runPlugins(input, options).then(files => {
	if (options.strip > 0) {
		files = files.map(x => {
			x.path = stripDirectory(x.path, options.strip);
			return x;
		}).filter(x => x.path !== ".");
	}
	if (!output) return files;

	return Promise.all(files.map(x => {
		const dest = join(output, x.path);
		const mode = x.mode & ~process.umask();
		const now = new Date();

		if (x.type === "directory") {
			return makeDir(dest)
				.then(() => utimes(dest, now, x.mtime))
				.then(() => x);
		}
		return makeDir(dirname(dest))
			.then(() => {
				if (x.type === "link") {
					return link(x.linkname, dest);
				}
				if (x.type === "symlink" && process.platform === "win32") {
					return link(x.linkname, dest);
				} else if (x.type === "symlink") {
					return symlink(x.linkname, dest);
				}

				return writeFile(dest, x.data, { mode });
			})
			.then(() => x.type === "file" && utimes(dest, now, x.mtime))
			.then(() => x);
	}));
});

module.exports = (input, output, options) => {
	if (typeof input !== "string" && !Buffer.isBuffer(input)) return Promise.reject(new TypeError("Input file required"));
	if (typeof output !== "string") return Promise.reject(new TypeError(`Expected output to be a path, received ${typeof output} instead`));

	options = Object.assign({
		plugins: [
			decompressZip(),
		],
	}, options);

	const read = typeof input === "string" ? readFile(input) : Promise.resolve(input);

	return read.then(buf => extractFile(buf, output, options));
};
