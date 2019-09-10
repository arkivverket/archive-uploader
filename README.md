# Archive Digitisation Uploader

## Getting started

Clone the repo and run the following command:

```
yarn install
```

Next you can start the application in development mode using the following command:

```
yarn start
```

> ⚠️ React components will automatically be reloaded when modified. However, if you make changes to the Electron application files (`public/electron.js`, `public/electron/*`) then you'll have to restart the application.

## Build for production

The following command will build a production-ready version of the application for your current platform:

```
yarn build
```

If you want to build a production-ready version the application for macOS then use the following command:

```
yarn build-mac
```

If you want to build a production-ready version the application for windows then use the following command:

```
yarn build-win
```

> Building a production-ready version version for Windows can only be done on a Windows machine with the EV code signing token.

---

# Protocol

The application will be launched using the custom `dpldr` protocol. The link will consist of the protocol followed by a base64 enoded JSON payload:

```
dpldr://eyJmb2xkZXJOYW1lIjoxNTQzOTI1NDM2LCJ1cGxvYWRVcmwiOiJodHRwOlwvXC9leGFtcGxlLm9yZ1wvdXBsb2FkIiwibWV0YSI6eyJ1c2VySWQiOjEyMywidW5pdElkIjoxMjMsImZvbGRlck5hbWUiOjE1NDM5MjU0MzZ9fQ==
```

> Note that the protocol is `dpldrdev` when the application run in development mode.

The payload must contain the following data:

```
$data = [
	'folderName' => 123,
	'reference'  => 'RA/EA-4070/Ki/L0009',
	'uploadUrl'  => 'http://example.org/upload',
	'meta'       => [
		'userId'     => 123, // Value must be signed
		'unitId'     => 123, // Value must be signed
		'folderName' => 123, // Value must be signed

	],
];
```

> The meta values must be signed by the Archive Digitisation application as they will be used to validate the upload using a TUS hook.

---

# Ideas for future versions

* Generate a file hash to ensure that the file as been transferred correctly? (Must be possible to turn on/off)
