const fs  = window.require('fs-extra')
const tar = window.require('tar')

/**
 * Builds a tar file from the source firectory and
 * returns a promise with the path to the generated tar file.
 *
 * @param  string sourceDir Source directory
 * @param  string output    Full path to the desired tar archive
 * @return Promise
 */
const buildTar = (sourceDir, output) => {
	return fs.readdir(sourceDir).then((files) => {
		let fileList = []

		files.forEach((file) => {
			if (file.charAt(0) !== '.' && fs.statSync(sourceDir + '/' + file).isFile()) {
				fileList.push(file)
			}
		})

		const options = {
			gzip: false,
			file: output,
			cwd: sourceDir
		}

		return tar.create(options, fileList).then(() => {
			return new Promise((resolve) => {
				resolve(options.file)
			})
		})
	})
}

export default buildTar
