const { join, dirname } = require("path");
const {
	utimes,
	link,
	symlink,
	writeFile,
} = require("fs-nextra");
const decompressZIP = require("./DecompressZIP");
const {
	Directory: {
		makeDir,
		stripDirectory,
	},
} = require("../Utils");

const extractFile = (input, output) => decompressZIP(input).then(files => {
	files = files.map(x => {
		x.path = stripDirectory(x.path, 1);
		return x;
	});
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
				switch (x.type) {
					case "link": {
						return link(x.linkname, dest);
					}
					case "symlink": {
						if (process.platform === "win32") {
							return link(x.linkname, dest)
						} else {
							return symlink(x.linkname, dest);
						}
					}
					default: {
						return writeFile(dest, x.data, { mode });
					}
				}
			})
			.then(() => x.type === "file" && utimes(dest, now, x.mtime))
			.then(() => x);
	}));
});

module.exports = (input, output) => {
	if (typeof input !== "string" && !Buffer.isBuffer(input)) return Promise.reject(new TypeError("Input file required"));
	if (typeof output !== "string") return Promise.reject(new TypeError(`Expected output to be a path, received ${typeof output} instead`));

	return Promise.resolve(input).then(buf => extractFile(buf, output));
};
