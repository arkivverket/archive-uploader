const electron          = require('electron')
const app               = electron.app
const BrowserWindow     = electron.BrowserWindow
const Menu              = electron.Menu
const path              = require('path')
const urlUtilities      = require('url')
const windowStateKeeper = require('electron-window-state')
const menu              = require('./electron/ui/menu')
const {is}              = require('electron-util');

let win

/**
 * Create window.
 */
function createWindow() {

	// Load the previous state with fallback to defaults

	let windowState = windowStateKeeper({
		defaultWidth: 500,
		defaultHeight: 800
	})

	// Create the application window and register it with the state keeper

	win = new BrowserWindow({
		titleBarStyle: is.macos ? 'hidden' : 'default',
		x: windowState.x,
		y: windowState.y,
		width: 500,
		height: 800,
		resizable: false,
		fullscreen: false,
		show: false
	})

	win.once('ready-to-show', () => {
		win.show()
	})

	windowState.manage(win)

	// Load the renderer

	if (is.development) {
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

// Create a window, register the protocol and
// set the application menu when the app is ready

app.on('ready', () => {
	createWindow()
	registerProtocol()
	Menu.setApplicationMenu(menu)
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
