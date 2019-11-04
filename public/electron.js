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

let mainWindow
let urlToOpenOnStartup
let closeWithoutDialog = false

const protocol = is.development ? 'dpldrdev' : 'dpldr'

if (!app.requestSingleInstanceLock()) {
	app.quit()
}
else {
	// Register custom protocol

	app.setAsDefaultProtocolClient(protocol)

	// Focus window if we have one and handle URL opening on Windows/Linux

	app.on('second-instance', (event, argv) => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) {
				mainWindow.restore()
			}

			mainWindow.focus()

			if (!is.macos) {
				const url = findUrlInArgs(protocol, argv)

				if (url !== false) {
					startUpload(mainWindow, url)
				}
			}
		}
	})

	// Handle URL opening

	if (is.macos) {
		app.on('open-url', (event, url) => {
			event.preventDefault()

			if (mainWindow) {
				startUpload(mainWindow, url)
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

	// Set the application menu and create the window when the app is ready

	app.on('ready', () => {
		Menu.setApplicationMenu(menu)

		// Load the previous state with fallback to defaults

		let windowState = windowStateKeeper({
			defaultWidth: 700,
			defaultHeight: 700
		})

		// Create the application window and register it with the state keeper

		mainWindow = new BrowserWindow({
			titleBarStyle: is.macos ? 'hidden' : 'default',
			x: windowState.x,
			y: windowState.y,
			width: windowState.width,
			height: windowState.height,
			minWidth: 500,
			minHeight: 500,
			show: false,
			webPreferences: {
				nodeIntegration: true
			}
		})

		windowState.manage(mainWindow)

		// Set the renderer

		if (is.development) {
			mainWindow.loadURL('http://localhost:3000')

			mainWindow.webContents.openDevTools()
		}
		else {
			mainWindow.loadURL(urlUtilities.format({
				pathname: path.join(__dirname, '../build/main.html'),
				protocol: 'file:',
				slashes: true
			}))
		}

		// Register auto-update event handlers

		autoUpdates(mainWindow)

		// Show and focus window once it's ready

		mainWindow.once('ready-to-show', () => {
			mainWindow.show()
			mainWindow.focus()
		})

		// Check for updates once the window is shown and trigger a upload if the app was started from a URL

		mainWindow.once('show', () => {
			if (!is.development && (is.macos || (is.windows && process.env.PORTABLE_EXECUTABLE_DIR === undefined))) {
				autoUpdater.checkForUpdates()
			}

			if (urlToOpenOnStartup) {
				startUpload(mainWindow, urlToOpenOnStartup)
			}
		})

		// Register window close event handler

		mainWindow.on('close', (event) => {
			if (!closeWithoutDialog) {
				event.preventDefault()

				mainWindow.webContents.send('can-i-close')

				ipcMain.once('can-i-close-reply', (event, canClose) => {
					if (canClose) {
						closeWithoutDialog = true

						mainWindow.close()
					}
				})
			}
		})

		// Register window closed event handler

		mainWindow.on('closed', () => {
			mainWindow = null
		})
	})

	// Quit when all windows are closed

	app.on('window-all-closed', () => {
		app.quit()
	})

	// Handle notifications from the renderer

	ipcMain.on('notification', (event, ...args) => {
		notification(...args)
	})

	// Update the badge count from the renderer

	ipcMain.on('set-badge-count', (event, count) => {
		app.badgeCount = count
	})
}
