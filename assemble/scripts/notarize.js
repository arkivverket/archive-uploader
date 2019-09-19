const { notarize } = require('electron-notarize')

const appleId = 'apple-developer@arkivverket.no'
// eslint-disable-next-line quotes
const appleIdPassword = `@keychain:AC_PASSWORD`

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