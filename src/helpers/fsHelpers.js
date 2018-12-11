const fs = window.require('fs-extra')

/**
 *
 */
const isDirectoryEmpty = (path) => {
	const files = fs.readdirSync(path)

	if (files.length === 0) {
		return true
	}

	const fileCount = files.length

	for (let i = 0; i < fileCount; i++) {
		if (files[i].charAt(0) !== '.' && fs.statSync(path + '/' + files[i]).isFile()) {
			return false
		}
	}

	return true
}

export { isDirectoryEmpty }
