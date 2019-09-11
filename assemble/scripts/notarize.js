const { notarize } = require('electron-notarize')

const appleId = '' // Fetch value from keychain https://github.com/electron/electron-notarize#safety-when-using-appleidpassword
const appleIdPassword = '' // Fetch value from keychain https://github.com/electron/electron-notarize#safety-when-using-appleidpassword

exports.default = async function notarizing(context) {
	if (context.electronPlatformName !== 'darwin' || context.packager.platformSpecificBuildOptions.identity === null) {
		return
	}

	const appName = context.packager.appInfo.productFilename

	return await notarize({
		appBundleId: 'no.arkivverket.digitalisering.uploader',
		appPath: `${context.appOutDir}/${appName}.app`,
		appleId: appleId,
		appleIdPassword: appleIdPassword,
	})
}