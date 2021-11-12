'use strict'

const fs       = require('fs-extra')
const Store    = require('electron-store')

const locale = (new Store()).get('locale')
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
