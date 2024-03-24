import { api } from '$lib/req';

const streamReader = (stream: ReadableStream) => {
	const reader = stream.getReader();
	let chunk = new Uint8Array(0);
	let chunkIndex = 0;
	return {
		async read(bv: ArrayBufferView | null) {
			if (!bv) return [0, 0];
			const view = new Uint8Array(bv.buffer, bv.byteOffset, bv.byteLength);
			const n = view.length;
			let viewIndex = 0;
			for (;;) {
				if (chunkIndex >= chunk.length) {
					chunkIndex = 0;
					const { value, done } = await reader.read();
					chunk = value;
					if (done) return [viewIndex, 1];
				}
				const end = n - viewIndex + chunkIndex;
				const slice = chunk.slice(chunkIndex, end);
				const len = slice.length;
				chunkIndex = chunkIndex + len;
				view.set(slice, viewIndex);
				viewIndex += len;
				if (viewIndex === n) return [viewIndex, 0];
			}
		}
	};
};

export const uploader = (file?: File) => {
	if (!file) return;
	const name = file.name;
	const type = file.type;
	const total = file.size;
	let uploaded = 0;
	let chunkSize = 0;
	let done = 0;
	let lastN = 0;
	type callbackFn = (info: {
		uploaded: number;
		total: number;
		uploading: boolean;
		result?: unknown;
	}) => void;
	let callback: callbackFn | undefined;
	const progress = (key?: string, done?: boolean) => {
		uploaded += chunkSize;
		if (callback) {
			const current = ((uploaded * 1000) / total) << 0;
			if (current !== lastN) {
				lastN = current;
				callback({
					uploaded,
					total,
					uploading: !done,
					result: key
				});
			}
		}
	};
	const reader = streamReader(file.stream());
	const rs = new ReadableStream<Uint8Array>({
		type: 'bytes',
		autoAllocateChunkSize: 1024,
		start() {},
		async pull(controller) {
			if (controller instanceof ReadableByteStreamController && controller.byobRequest) {
				const br = controller.byobRequest;
				progress();
				[chunkSize, done] = await reader.read(br.view);
				br.respond(chunkSize);
				if (done) controller.close();
			} else {
				throw Error('unsupported type');
			}
		}
	});
	api('files')
		.post(rs)
		.withHeaders({
			'x-file-name': name,
			'x-file-type': type
		})
		.success((a) => {
			progress(a as string, true);
		})
		.fail(() => {
			// todo: error handle
			progress('', true);
		});
	return {
		progress(cb: callbackFn) {
			callback = cb;
		}
	};
};
