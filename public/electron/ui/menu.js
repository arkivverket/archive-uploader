'use strict'

const electron = require('electron')
const app      = electron.app
const Menu     = electron.Menu
const {is}     = require('electron-util')

// Base template

const template = [
	{role: 'windowMenu'},
	{
		role: 'help',
		submenu: [
			{
				label: 'Digitalisering',
				click: () => {
					electron.shell.openExternal('https://digitalisering.arkivverket.no')
				}
			}
		]
	}
]

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
