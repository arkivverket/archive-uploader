const { notarize } = require('electron-notarize')

const appleId = '' // Fetch value from keychain https://github.com/electron/electron-notarize#safety-when-using-appleidpassword
const appleIdPassword = '' // Fetch value from keychain https://github.com/electron/electron-notarize#safety-when-using-appleidpassword

exports.default = async function notarizing(context) {
	const { electronPlatformName, appOutDir } = context

	if (electronPlatformName !== 'darwin') {
		return
	}

	const appName = context.packager.appInfo.productFilename

	return await notarize({
		appBundleId: 'no.arkivverket.digitalisering',
		appPath: `${appOutDir}/${appName}.app`,
		appleId: appleId,
		appleIdPassword: appleIdPassword,
	})
}