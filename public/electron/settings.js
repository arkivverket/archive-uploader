'use strict'

const electron      = require('electron')
const BrowserWindow = electron.BrowserWindow
const {is}          = require('electron-util')

const settings = {}

let settingsWindow = null

/**
 * Returns the main window.
 *
 * @return BrowserWindow
 */
const getMainWindow = () => {
	let mainWindow = BrowserWindow.getFocusedWindow()

	if (mainWindow !== null) {
		return mainWindow
	}

	mainWindow = BrowserWindow.getAllWindows()[0]

	mainWindow.restore()

	mainWindow.focus()

	return mainWindow
}

/**
 * Is the settings window open?
 */
settings.isOpen = () => {
	return settingsWindow !== null
}

/**
 * Opens the settings window.
 */
settings.open = () => {
	const mainWindow = getMainWindow()

	if (settingsWindow === null) {
		settingsWindow = new BrowserWindow({
			modal: true,
			parent: mainWindow,
			width: 500,
			height: 500,
			show: false,
			resizable: false,
			webPreferences: {
				nodeIntegration: true,
				enableRemoteModule: true,
				worldSafeExecuteJavaScript: true,
			}
		})

		if (!is.macos) {
			settingsWindow.removeMenu()
		}

		// Set the renderer

		if (is.development) {
			settingsWindow.loadURL('http://localhost:3000/#/settings')
		}
		else {
			settingsWindow.loadURL(`file://${__dirname}/../index.html#/settings`)
		}

		// Show and focus window once it's ready

		settingsWindow.once('ready-to-show', () => {
			settingsWindow.show()
			settingsWindow.focus()
		})

		// Register window closed event handler

		settingsWindow.on('closed', () => {
			settingsWindow = null
		})
	}
}

/**
 * Closes the settings window.
 */
settings.close = () => {
	if (settingsWindow !== null) {
		settingsWindow.close()
	}
}

module.exports = settings
