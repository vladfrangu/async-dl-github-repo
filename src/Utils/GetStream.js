const { PassThrough } = require("stream");

const BufferStream = () => {
	let len = 0;
	const ret = [];
	const stream = new PassThrough({ objectMode: false });

	stream.on("data", chunk => {
		ret.push(chunk);
		len += chunk.length;
	});
	stream.getBufferedValue = () => Buffer.concat(ret, len);
	stream.getBufferedLength = () => len;
	return stream;
};

module.exports = inputStream => {
	if (!inputStream) return Promise.reject(new Error(`Expected a stream, got ${typeof inputStream}`));
	let stream = BufferStream(), clean;

	const p = new Promise((resolve, reject) => {
		const error = err => {
			if (err) err.bufferedData = stream.getBufferedValue();
			reject(err);
		};

		inputStream.once("error", error);
		inputStream.pipe(stream);
		stream.once("error", error).on("end", resolve);

		clean = () => {
			if (inputStream.unpipe) inputStream.unpipe(stream);
		};
	});

	return p.then(clean, clean).then(() => stream.getBufferedValue());
};
