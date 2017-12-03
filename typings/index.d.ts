declare module "async-dl-github-repo" {

	export default function download(url: string, path: string, zipOnly?: boolean): AsyncDLGithubRepo;
	export const version: string;

	class AsyncDLGithubRepo {
		public version: string;
		public constructor (url: string, path: string, zipOnly?: boolean = false);

		public then(resolver: Function, rejecter?: Function): Promise<DownloadReturn>;
		public catch(rejecter: Function);
		public end(callback: (err: Error | RangeError | TypeError, result: DownloadReturn) => void): void;
	}

	type DownloadReturn = {
		zipPath? : string;
		finalPath? : string;
	};
}
