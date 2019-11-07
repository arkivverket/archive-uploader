'use strict'

const electron      = require('electron')
const dialog        = electron.dialog
const Menu          = electron.Menu
const {autoUpdater} = require('electron-updater')
const i18n          = require('i18n')
const notification  = require('../helpers/notification')

let showUpdateNotAvailableMessage = false

/**
 * @param string label Menu
 */
const getHelpMenuItem = (label) => {
	return Menu.getApplicationMenu().items.filter((item) => {
		return item.role === 'help'
	})[0].submenu.items.filter((item) => {
		return item.lblid === label
	})[0]
}

/**
 * @param BrowserWindow window BrowserWindow instance
 */
const autoUpdates = (window) => {
	autoUpdater.on('checking-for-update', () => {
		getHelpMenuItem('check_for_updates').enabled = false
	})

	autoUpdater.on('update-available', () => {
		getHelpMenuItem('check_for_updates').visible = false
		getHelpMenuItem('downloading_update').visible = true
	})

	autoUpdater.on('update-not-available', () => {
		getHelpMenuItem('check_for_updates').enabled = true

		if (showUpdateNotAvailableMessage) {
			dialog.showMessageBox(window, {
				type: 'none',
				message: 'Ingen oppdatering funnet.'
			})
		}

		showUpdateNotAvailableMessage = true
	})

	autoUpdater.on('error', (event, error) => {
		getHelpMenuItem('check_for_updates').visible = true
		getHelpMenuItem('check_for_updates').enabled = true
		getHelpMenuItem('downloading_update').visible = false

		dialog.showMessageBox(window, {
			type: 'error',
			message: 'Det skjedde en feil under oppdatering:',
			detail: error
		})
	})

	autoUpdater.on('download-progress', () => {
		// @todo: Display download progress in menu
	})

	autoUpdater.on('update-downloaded', () => {
		getHelpMenuItem('downloading_update').visible = false
		getHelpMenuItem('restart_to_update').visible = true

		notification(i18n.__('Update'), i18n.__('A new version of Uploader has been downloaded. Restart the application to update.'))
	})
}

module.exports = autoUpdates
