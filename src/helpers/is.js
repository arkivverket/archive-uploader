module.exports = {
	macos: window.process.platform === 'darwin',
	linux: window.process.platform === 'linux',
	windows: window.process.platform === 'win32',
	main: window.process.type === 'browser',
	renderer: window.process.type === 'renderer',
	macAppStore: window.process.mas === true,
	windowsStore: window.process.windowsStore === true
}
