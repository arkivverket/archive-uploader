'use strict'

const {Notification} = require('electron')

/**
 * Creates a desktop notification.
 *
 * @param string           title             Message title
 * @param string           body              Message body
 * @param object|undefined additionalOptions Additional options
 */
const notification = (title, body, additionalOptions) => {
	let options = {
		title: title,
		body: body
	}

	if (additionalOptions !== undefined) {
		options = Object.assign(additionalOptions, options)
	}

	const notification = new Notification(options)

	notification.show()
}

module.exports = notification
