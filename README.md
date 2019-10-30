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

> 💡 React components will automatically be reloaded when modified. However, if you make changes to the Electron application files (`public/electron.js`, `public/electron/*`) then you'll have to restart the application.

## Build for production

If you want to build a production-ready version the application for macOS then use the following command:

```
yarn build-mac
```

If you want to build a production-ready version the application for Windows then use the following command:

```
yarn build-win
```

> ⚠️ Building signed versions should only be done on the dedicated code-signing machine.

## Build for test

If you want to build a production-ready unsigned version the application for macOS then use the following command:

```
yarn build-mac-test
```

If you want to build a production-ready unsigned version the application for Windows then use the following command:

```
yarn build-win-test
```

---

# Protocol

The application will be launched using the custom `dpldr` protocol. The link will consist of the protocol followed by a base64 enoded JSON payload:

```
dpldr://eyJmb2xkZXJOYW1lIjoxNTQzOTI1NDM2LCJ1cGxvYWRVcmwiOiJodHRwOlwvXC9leGFtcGxlLm9yZ1wvdXBsb2FkIiwibWV0YSI6eyJ1c2VySWQiOjEyMywidW5pdElkIjoxMjMsImZvbGRlck5hbWUiOjE1NDM5MjU0MzZ9fQ==
```

> Note that the protocol is `dpldrdev` when the application run in development mode.

The payload must contain the following data. Note that the meta block is optional (in this example it is specific for the Archive Digitisation application):

```
$data = [
	'reference'  => 'RA/EA-4070/Ki/L0009',       // (required) Name or reference that lets the user identify of the upload
	'uploadUrl'  => 'http://example.org/upload', // (required) URL to the tusd endpoint
	'uploadType' => 'folder',                    // (optional) Upload type. The allowed types are 'folder' and 'tar' (default: 'folder')
	'meta'       => [                            // (optional) Metadata that is sent back to the tusd server when the upload starts
		'userId'     => 123, // Value must be signed
		'unitId'     => 123, // Value must be signed
		'folderName' => 123, // Value must be signed

	],
];
```

> The meta values must be signed by the Archive Digitisation application as they will be used to validate the upload using a TUS hook.
