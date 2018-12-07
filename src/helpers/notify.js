const electron = window.require('electron')

/**
 * Creates a notification if allowed.
 *
 * @param string message Message
 */
const notify = (message) => {
	const notification = new Notification(electron.remote.app.getName(), {
		body: message
	})
}

export default notify
