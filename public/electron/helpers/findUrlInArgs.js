'use strict'

/**
 * Finds a url matching the protocol in the argument array.
 * Null is returned if none is found.
 *
 * @param  string protocol protocol prefix
 * @param  array  argv     arguments
 * @return string|false
 */
const findUrlInArgs = (protocol, argv) => {
	const arguments = argv.length

	for (let i = 0; i < arguments; i++) {
		if (argv[i].startsWith(protocol + '://')) {
			return argv[i].replace(/\/$/, '') // Strip trailing slashes since Windows appends one
		}
	}

	return false;
}

module.exports = findUrlInArgs
