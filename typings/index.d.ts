declare module "async-dl-github-repo" {

	declare function download(repo: string, destination: string, downloadOnly? : boolean = false): Promise<DownloadReturn>;
	export = download;

	type DownloadReturn = {
		zipPath? : string;
		finalPath? : string;
	};
}
