const electron = window.require('electron')
const fs       = window.require('fs-extra')
const path     = window.require('path')
const tar      = window.require('tar')
const {is}     = window.require('electron-util')

/**
 * Builds a tar file from the source firectory and
 * returns a promise with the path to the generated tar file.
 *
 * @param  string sourceDir Source directory
 * @param  string tarName   Desired tar name (without extension)
 * @return Promise
 */
export const buildTar = (sourceDir, tarName) => {
	return fs.readdir(sourceDir).then((files) => {
		let fileList = []

		files.forEach((file) => {
			if (file.charAt(0) !== '.' && fs.statSync(sourceDir + '/' + file).isFile()) {
				fileList.push(file)
			}
		})

		const options = {
			gzip: false,
			file: path.join(electron.remote.app.getPath(is.development ? 'downloads' : 'temp'), tarName + '.tar'),
			cwd: sourceDir
		}

		return tar.create(options, fileList).then(() => {
			return new Promise((resolve, reject) => {
				resolve(options.file)
			})
		})
	})
}
