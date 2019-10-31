'use strict'

const electron        = require('electron')
const dialog          = electron.dialog
const validatePayload = require('./validatePayload')

const startUpload = (win, url) => {
	const payload = Buffer.from(url.split('//').pop(), 'base64').toString('utf8')

	if (!validatePayload(payload)) {
		dialog.showMessageBox(win, {
			type: 'error',
			message: 'Lenken du trykket på er ugyldig.'
		})

		return
	}

	win.webContents.send('start-upload', payload)
}

module.exports = startUpload