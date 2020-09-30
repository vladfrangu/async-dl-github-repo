<div>
  <br />
  <p>
    <a href="https://www.npmjs.com/package/async-dl-github-repo"><img src="https://img.shields.io/npm/v/async-dl-github-repo.svg?maxAge=3600" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/async-dl-github-repo"><img src="https://img.shields.io/npm/dt/async-dl-github-repo.svg?maxAge=3600" alt="NPM downloads" /></a>
    <a href="https://david-dm.org/KingDGrizzle/async-dl-github-repo"><img src="https://img.shields.io/david/KingDGrizzle/async-dl-github-repo.svg?maxAge=3600" alt="Dependencies" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/async-dl-github-repo/"><img src="https://nodei.co/npm/async-dl-github-repo.png?downloads=true&stars=true" alt="NPM info"></a>
  </p>
</div>

# async-dl-github-repo

Asynchronously download a GitHub Repo

## Installation

**Node.js 8.0 or newer is required**

To install this module, just run:

```
npm i async-dl-github-repo
```

## Usage and Examples

This module has one function, that is exported by default.

### download(repo, destination, downloadOnly = false)

Download a GitHub repo, `repo` should be in the format: `Username/ProjectName[#branch-name]`, where `#branch-name` is optional. (Don't include the brackets). By default, the branch is set to `master`.

`path` should be relative to the [process cwd](https://nodejs.org/api/process.html#process_process_cwd)

`downloadOnly` is optional, but you can make it just save the archive

Returns a Promise that resolves with the zip and final paths if the download was successful, or rejects if there were any errors.

Example:

```js
const dlRepo = require("async-dl-github-repo");

dlRepo("vladfrangu/async-dl-github-repo", "./temp").then(results => {
  console.log(`Downloaded successfuly at ${results.finalPath}`);
}).catch(err => {
  console.error(`Download errored: ${err}`);
});
```

Downloading just the archive:

```js
const dlRepo = require("async-dl-github-repo");

dlRepo("vladfrangu/async-dl-github-repo", "./temp", true).then(results => {
  console.log(`Downloaded at ${results.zipPath}`);
}).catch(err => {
  console.error(`Download errored: ${err}`);
});
```
