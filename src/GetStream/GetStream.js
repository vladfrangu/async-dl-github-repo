/**
 * https://github.com/sindresorhus/get-stream
 */
const bufferStream = require("./BufferStream");

const getStream = (inputStream, options) => {
	if (!inputStream) return Promise.reject(new Error(`Expected a stream, got ${typeof inputStream}`));

	options = Object.assign({ maxBuffer: Infinity }, options);

	const maxBuffer = options.maxBuffer;
	let stream, clean;

	const p = new Promise((resolve, reject) => {
		const error = err => {
			// Check if err isn't null
			if (err) err.bufferedData = stream.getBufferedValue();
			reject(err);
		};

		stream = bufferStream(options);
		inputStream.once("error", error);
		inputStream.pipe(stream);

		stream.on("data", () => {
			if (stream.getBufferedLength() > maxBuffer) reject(new Error("options.maxBuffer was exceeded"));
		});
		stream.once("error", error).on("end", resolve);

		clean = () => {
			if (inputStream.unpipe) inputStream.unpipe(stream);
		};
	});

	p.then(clean, clean);

	return p.then(() => stream.getBufferedValue());
};

module.exports = (stream, options) => getStream(stream, Object.assign({}, options, { encoding: "buffer" }));
