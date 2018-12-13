const electron = window.require('electron')

/**
 * Creates a desktop notification.
 *
 * @param string           message           Message
 * @param object|undefined additionalOptions Additional options
 */
const notify = (message, additionalOptions) => {
	let options = {
		body: message
	}

	if (additionalOptions !== undefined) {
		options = Object.assign(additionalOptions, options)
	}

	new Notification(electron.remote.app.getName(), options)
}

export default notify
