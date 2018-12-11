'use strict'

/**
 * Returns the first URL with the specified protocol or false.
 *
 * @param  string protocol Protocol prefix
 * @param  array  argv     Arguments
 * @return string|false
 */
const findUrlInArgs = (protocol, argv) => {
	for (let i = 0; i < argv.length; i++) {
		if (argv[i].startsWith(protocol + '://')) {
			return argv[i].replace(/\/$/, '') // Strip trailing slashes
		}
	}

	return false
}

module.exports = findUrlInArgs
