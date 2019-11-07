'use strict'

const electron = require('electron')
const fs       = require('fs-extra')

const locale = electron.app ? electron.app.getLocale() : electron.remote.app.getLocale()

let strings = null

/**
 *
 */
class i18n {
	/**
	 *
	 */
	static __ = (string) => {
		if (strings === null) {
			if (fs.existsSync(`${__dirname}/strings/${locale}.json`)) {
				strings = JSON.parse(fs.readFileSync(`${__dirname}/strings/${locale}.json`))
			}
			else {
				strings = JSON.parse(fs.readFileSync(`${__dirname}/strings/en.json`))
			}
		}

		if (strings[string] === undefined) {
			return string
		}

		return strings[string]
	}
}

module.exports = i18n
