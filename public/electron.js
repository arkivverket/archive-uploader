'use strict'

const electron          = require('electron')
const {autoUpdater}     = require('electron-updater')
const app               = electron.app
const BrowserWindow     = electron.BrowserWindow
const Menu              = electron.Menu
const ipcMain           = electron.ipcMain
const path              = require('path')
const urlUtilities      = require('url')
const windowStateKeeper = require('electron-window-state')
const {is}              = require('electron-util')
const menu              = require('./electron/ui/menu')
const findUrlInArgs     = require('./electron/helpers/findUrlInArgs')
const notification      = require('./electron/helpers/notification')
const startUpload       = require('./electron/helpers/startUpload')
const autoUpdates       = require('./electron/events/autoUpdates')

let win
let urlToOpenOnStartup
let closeWithoutDialog = false

const protocol = is.development ? 'dpldrdev' : 'dpldr'

if (!app.requestSingleInstanceLock()) {
	app.quit()
}
else {
	// Focus window if we have one and handle URL opening on Windows/Linux

	app.on('second-instance', (event, argv) => {
		if (win) {
			if (win.isMinimized()) {
				win.restore()
			}

			win.focus()

			if (!is.macos) {
				const url = findUrlInArgs(protocol, argv)

				if (url !== false) {
					startUpload(win, url)
				}
			}
		}
	})

	// Register custom protocol

	app.setAsDefaultProtocolClient(protocol)

	// Handle URL opening

	if (is.macos) {
		app.on('open-url', (event, url) => {
			event.preventDefault()

			if (win) {
				startUpload(win, url)
			}
			else {
				urlToOpenOnStartup = url
			}
		})
	}
	else {
		const url = findUrlInArgs(protocol, process.argv)

		if (url !== false) {
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
			show: false,
			webPreferences: {
				nodeIntegration: true
			}
		})

		windowState.manage(win)

		// Register auto-update event handlers

		autoUpdates(win)

		// Show and focus window once it's ready

		win.once('ready-to-show', () => {
			win.show()
			win.focus()

			if (!is.development && (is.macos || (is.windows && process.env.PORTABLE_EXECUTABLE_DIR === undefined))) {
				autoUpdater.checkForUpdates()
			}
		})

		// Register close event handler

		win.on('close', (event) => {
			if (!closeWithoutDialog) {
				event.preventDefault()

				win.webContents.send('can-i-close')

				ipcMain.once('can-i-close-reply', (event, canClose) => {
					if (canClose) {
						closeWithoutDialog = true

						win.close()
					}
				})
			}
		})

		// Register closed event handler

		win.on('closed', () => {
			win = null
		})

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
	}

	// Create a window and set the application menu when the app is ready

	app.on('ready', () => {
		Menu.setApplicationMenu(menu)

		createWindow()

		if (urlToOpenOnStartup) {
			win.once('show', () => {
				startUpload(win, urlToOpenOnStartup)

				urlToOpenOnStartup = null
			})
		}
	})

	// Quit when all windows are closed

	app.on('window-all-closed', () => {
		app.quit()
	})

	// Handle notifications from the renderer

	ipcMain.on('notification', (event, ...args) => {
		notification(...args)
	})
}
