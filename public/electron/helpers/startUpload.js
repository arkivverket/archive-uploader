'use strict'

const electron        = require('electron')
const dialog          = electron.dialog
const validatePayload = require('./validatePayload')

/**
 * Triggers a new upload.
 *
 * @param BrowserWindow window BrowserWindow instance
 * @param string        url    URL
 */
const startUpload = (window, url) => {
	const payload = Buffer.from(url.split('//').pop(), 'base64').toString('utf8')

	if (!validatePayload(payload)) {
		dialog.showMessageBox(window, {
			type: 'error',
			message: 'Lenken du trykket på er ugyldig.'
		})

		return
	}

	window.webContents.send('start-upload', payload)
}

module.exports = startUpload
