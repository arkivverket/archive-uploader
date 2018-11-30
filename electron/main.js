const electron      = require('electron')
const app           = electron.app
const BrowserWindow = electron.BrowserWindow
const path          = require('path')
const urlUtilities  = require('url')
const isDev         = require('electron-is-dev')

let win

/**
 * Create window.
 */
function createWindow() {
	// Create the browser window

	win = new BrowserWindow({
		width: 500,
		height: 800
	})

	// Load the renderer

	if (isDev) {
		win.loadURL('http://localhost:3000')

		win.webContents.openDevTools()
	}
	else {
		win.loadURL(urlUtilities.format({
			pathname: path.join(__dirname, '../build/index.html'),
			protocol: 'file:',
			slashes: true
		}))
	}

	// Register close event

	win.on('closed', () => {
		win = null
	})
}

/**
 * Register protocol and open-url event handler.
 */
function registerProtocol() {
	// Register custom protocol

	app.setAsDefaultProtocolClient('dpldr')

	// Register protocol handler

	app.on('open-url', function (event, url) {
		 win.webContents.send('start-upload', url)
	})
}

// Create a window and register the protocol when the app is ready

app.on('ready', () => {
	createWindow()
	registerProtocol()
})

// Quit when all windows are closed

app.on('window-all-closed', () => {
	app.quit()
})

// Create a new window if none exists when the app is activated

app.on('activate', () => {
	if (win === null) {
		createWindow()
	}
})
