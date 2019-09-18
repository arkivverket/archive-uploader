'use strict'

const electron      = require('electron')
const {autoUpdater} = require('electron-updater')
const dialog        = electron.dialog
const app           = electron.app
const Menu          = electron.Menu
const {is}          = require('electron-util')

// Base template

const template = [
	{role: 'windowMenu'},
	{
		role: 'help',
		submenu: [
			{
				lblid: 'digitisation_link',
				label: 'Digitalisering',
				click: () => {
					electron.shell.openExternal('https://digitalisering.arkivverket.no')
				}
			},
			{
				type: 'separator',
				visible: !is.development
			},
			{
				lblid: 'check_for_updates',
				label: 'Se etter oppdatering...',
				click: () => {
					autoUpdater.checkForUpdates()
				},
				visible: !is.development,
				enabled: true
			},
			{
				lblid: 'downloading_update',
				label: 'Laster ned oppdatering...',
				visible: false,
				enabled: false
			},
			{
				lblid: 'restart_to_update',
				label: 'Start på nytt for å oppdatere',
				click: () => {
					autoUpdater.quitAndInstall()
				},
				visible: false,
				enabled: true
			}
		]
	}
]

// Add Windows specific menu items

if (is.windows) {
	template[1].submenu.push(
		{
			type: 'separator'
		},
		{
			lblid: 'about',
			label: 'Om Uploader',
			click: () => {
				dialog.showMessageBox(null, {
					'type': 'info',
					'message': `Uploader v${electron.app.getVersion()}`,
				})
			}
		}
	)
}

// Add macOS specific menu items

if (is.macos) {
	template.unshift({
		label: app.getName(),
		submenu: [
			{role: 'about'},
			{type: 'separator'},
			{role: 'services', submenu: []},
			{type: 'separator'},
			{role: 'hide'},
			{role: 'hideothers'},
			{role: 'unhide'},
			{type: 'separator'},
			{role: 'quit'}
		]
	})
}

// Build menu and export it

module.exports = Menu.buildFromTemplate(template)
