'use strict'

const electron          = require('electron')
const {autoUpdater}     = require('electron-updater')
const app               = electron.app
const BrowserWindow     = electron.BrowserWindow
const Menu              = electron.Menu
const ipcMain           = electron.ipcMain
const dialog            = electron.dialog
const path              = require('path')
const urlUtilities      = require('url')
const windowStateKeeper = require('electron-window-state')
const menu              = require('./electron/ui/menu')
const findUrlInArgs     = require('./electron/helpers/findUrlInArgs')
const {is}              = require('electron-util')

let win
let urlToOpenOnStartup
let closeWithoutDialog = false
let showUpdateNotAvailableMessage = false

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
					win.webContents.send('start-upload', url)
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
				win.webContents.send('start-upload', url)
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

		if (!is.development) {
			autoUpdater.checkForUpdates()
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

	// Auto-update event handlers + helpers

	const getHelpMenuItem = (label) => {
		return Menu.getApplicationMenu().items.filter((item) => {
			return item.role === 'help'
		})[0].submenu.items.filter((item) => {
			return item.lblid === label
		})[0]
	}

	autoUpdater.on('checking-for-update', () => {
		getHelpMenuItem('check_for_updates').enabled = false
	})

	autoUpdater.on('update-available', (/*event, info*/) => {
		getHelpMenuItem('check_for_updates').visible = false
		getHelpMenuItem('downloading_update').visible = true
	})

	autoUpdater.on('update-not-available', (/*event, info*/) => {
		getHelpMenuItem('check_for_updates').enabled = true

		if(showUpdateNotAvailableMessage) {
			dialog.showMessageBox(win, {
				type: 'none',
				message: 'Ingen oppdatering funnet.'
			})
		}

		showUpdateNotAvailableMessage = true
	})

	autoUpdater.on('error', (event, error) => {
		getHelpMenuItem('downloading_update').visible = true
		getHelpMenuItem('check_for_updates').visible = true
		getHelpMenuItem('check_for_updates').enabled = true

		dialog.showMessageBox(win, {
			type: 'error',
			message: 'Det skjedde en feil under oppdatering:',
			detail: error
		})
	})

	autoUpdater.on('download-progress', (/*event, progress*/) => {
		// @todo: Display download progress in menu
	})

	autoUpdater.on('update-downloaded', (/*event, info*/) => {
		getHelpMenuItem('downloading_update').visible = false
		getHelpMenuItem('restart_to_update').visible = true

		// @todo: Show some visual indication to the user that an update is available
	})
}
