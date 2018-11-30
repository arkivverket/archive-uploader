'use strict'

const electron = require('electron')
const app      = electron.app
const Menu     = electron.Menu

// Base template

const template = []

// Add macOS specific menu items

if(process.platform === 'darwin')
{
	template.unshift({
		label: app.getName(),
		submenu: [
		{
			role: 'about'
		},
		{
			type: 'separator'
		},
		{
			label: 'Services',
			role: 'services',
			submenu: []
		},
		{
			type: 'separator'
		},
		{
			label: 'Hide ' + app.getName(),
			accelerator: 'Command+H',
			role: 'hide'
		},
		{
			label: 'Hide Others',
			accelerator: 'Command+Shift+H',
			role: 'hideothers'
		},
		{
			label: 'Show All',
			role: 'unhide'
		},
		{
			type: 'separator'
		},
		{
			label: 'Quit',
			accelerator: 'Command+Q',
			click: () => {
				app.quit()
			}
		}]
	})
}

// Build menu and export it

module.exports = Menu.buildFromTemplate(template)
