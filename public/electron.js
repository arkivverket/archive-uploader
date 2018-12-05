'use strict'

const electron          = require('electron')
const app               = electron.app
const BrowserWindow     = electron.BrowserWindow
const Menu              = electron.Menu
const path              = require('path')
const urlUtilities      = require('url')
const windowStateKeeper = require('electron-window-state')
const menu              = require('./electron/ui/menu')
const findUrlInArgs     = require('./electron/helpers/findUrlInArgs')
const {is}              = require('electron-util')

let win
let urlToOpenOnStartup

const protocol = is.development ? 'dpldrdev' : 'dpldr'

if (!app.requestSingleInstanceLock()) {
	app.quit()
}
else {
	// Focus on window if we have one and handle URLs on non-macOS systems

	app.on('second-instance', (event, argv) => {
		if (win) {
			if (win.isMinimized()) {
				win.restore()
			}

			win.focus()

			if (!is.macos) {
				const url = findUrlInArgs(protocol, argv)

				if (url !== null) {
					win.webContents.send('start-upload', url)
				}
			}
		}
	})

	// Register custom protocol

	app.setAsDefaultProtocolClient(protocol)

	// Handle opened URL opening

	if (is.macos) {
		app.on('open-url', (event, url) => {
			event.preventDefault()

			if (win) {
				win.webContents.send('start-upload', url)
			}
			else {
				urlToOpenOnStartup = url
			}
		})
	}
	else {
		const url = findUrlInArgs(protocol, process.argv)

		if (url !== null) {
			urlToOpenOnStartup = url
		}
	}

	/**
	 * Create window.
	 */
	const createWindow = () => {

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
			width: windowState.width,
			height: windowState.height,
			minHeight: 500,
			minWidth: 500,
			show: false
		})

		win.once('ready-to-show', () => {
			win.show()
			win.focus()
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

	// Create a window and set the application menu when the app is ready

	app.on('ready', () => {
		createWindow()

		Menu.setApplicationMenu(menu)

		if (urlToOpenOnStartup) {
			win.once('show', () => {
				win.webContents.send('start-upload', urlToOpenOnStartup)

				urlToOpenOnStartup = null
			})
		}
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
}
