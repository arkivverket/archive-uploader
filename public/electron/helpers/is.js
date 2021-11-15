const electron = require('electron')

if (typeof electron === 'string') {
	throw new TypeError('Not running in an Electron environment!')
}

const isEnvSet = 'ELECTRON_IS_DEV' in process.env
const getFromEnv = Number.parseInt(process.env.ELECTRON_IS_DEV, 10) === 1

const isDev = isEnvSet ? getFromEnv : !electron.app.isPackaged

module.exports = {
	macos: process.platform === 'darwin',
	linux: process.platform === 'linux',
	windows: process.platform === 'win32',
	main: process.type === 'browser',
	renderer: process.type === 'renderer',
	development: isDev,
	macAppStore: process.mas === true,
	windowsStore: process.windowsStore === true
}
