'use strict'

const electron      = require('electron')
const {autoUpdater} = require('electron-updater')
const dialog        = electron.dialog
const app           = electron.app
const Menu          = electron.Menu
const {is}          = require('electron-util')
const settings      = require('../settings')
const i18n          = require('../../../i18n/i18n')

// Base template

const template = [
	{role: 'windowMenu', label: i18n.__('Window')},
	{
		role: 'help',
		label: i18n.__('Help'),
		submenu: [
			{
				lblid: 'digitisation_link',
				label: 'Digitalisering',
				click: () => {
					electron.shell.openExternal('https://digitalisering.arkivverket.no')
				}
			}
		]
	}
]

// Add production specific menu items

if (!is.development && (is.macos || (is.windows && process.env.PORTABLE_EXECUTABLE_DIR === undefined))) {
	template[1].submenu.push(
		{
			type: 'separator',
		},
		{
			lblid: 'check_for_updates',
			label: i18n.__('Check for Updates...'),
			click: () => {
				autoUpdater.checkForUpdates()
			},
			visible: true,
			enabled: true
		},
		{
			lblid: 'downloading_update',
			label: i18n.__('Downloading Updates...'),
			visible: false,
			enabled: false
		},
		{
			lblid: 'restart_to_update',
			label: i18n.__('Restart to Update'),
			click: () => {
				autoUpdater.quitAndInstall()
			},
			visible: false,
			enabled: true
		}
	)
}

// Add Linux and Windows specific menu items

if (is.windows || is.linux) {
	template[1].submenu.push(
		{
			type: 'separator'
		},
		{
			lblid: 'about',
			label: i18n.__('About Uploader'),
			click: () => {
				if (is.linux) {
					app.showAboutPanel()
				}
				else {
					dialog.showMessageBox(null, {
						'type': 'info',
						'message': `Uploader v${electron.app.getVersion()}`,
					})
				}
			}
		}
	)
}

// Add macOS or Linux and Windows specific menu items

if (is.macos) {
	template.unshift({
		label: app.name,
		submenu: [
			{role: 'about', label: i18n.__('About Uploader')},
			{type: 'separator'},
			{label: i18n.__('Preferences...'), accelerator: 'Command+,', click: () => {
				settings.open()
			}},
			{type: 'separator'},
			{role: 'services', label: i18n.__('Services'), submenu: []},
			{type: 'separator'},
			{role: 'hide', label: i18n.__('Hide Uploader')},
			{role: 'hideothers', label: i18n.__('Hide Others')},
			{role: 'unhide', label: i18n.__('Show All')},
			{type: 'separator'},
			{role: 'quit', label: i18n.__('Quit Uploader')}
		]
	})
}
else {
	template.unshift({
		role: 'fileMenu',
		submenu: [
			{label: i18n.__('Preferences...'), accelerator: 'Ctrl+,', click: () => {
				settings.open()
			}},
			{type: 'separator'},
			{role: 'quit', label: i18n.__('Quit Uploader')}
		]
	})
}

// Build menu and export it

module.exports = Menu.buildFromTemplate(template)
