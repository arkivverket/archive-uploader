'use strict'

/**
 * Finds a url matching the protocol in the argument array.
 * Null is returned if none is found.
 *
 * @param  string protocol protocol prefix
 * @param  array  argv     arguments
 * @return string|null
 */
const findUrlInArgs = (protocol, argv) => {
	let url = null;

	argv.forEach((value) => {
		if (value.startsWith(protocol + '://')) {
			url = value.replace(/\/$/, '')
		}
	})

	return url;
}

module.exports = findUrlInArgs
