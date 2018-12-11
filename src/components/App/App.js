import React, { Component } from 'react'
import { isDirectoryEmpty } from '../../helpers/fsHelpers'
import Uploader from './Uploader/Uploader'
import Uploads from './Uploads/Uploads'
import './App.scss'

const electron = window.require('electron')
const fs       = window.require('fs-extra')
const md5      = window.require('md5')

/**
 *
 */
class App extends Component {
	/**
	 *
	 */
	state = {
		uploadTemplate: null,
		uploads: []
	}

	/**
	 *
	 */
	restoreUploads = () => {
		let uploads = window.localStorage.getItem('uploads')

		if (uploads !== null) {
			uploads = JSON.parse(uploads)

			for (let i; i < uploads.length; i++) {
				let directory = uploads[i].sourceDirectory

				if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory() || isDirectoryEmpty(directory)) {
					uploads.splice(i, 1)
				}
			}

			this.setState({uploads: uploads})

			window.localStorage.setItem('uploads', JSON.stringify(uploads))
		}
	}

	/**
	 *
	 */
	buildCurrentUploadTemplate = (url) => {
		const data = JSON.parse(window.atob(url.split('//').pop()))

		return {
			id: md5(url),
			folderName: data.folderName,
			uploadUrl: data.uploadUrl,
			meta: data.meta
		}
	}

	/**
	 *
	 */
	uploadExists = (id) => {
		for (let i; i < this.state.uploads.length; i++) {
			if (this.state.uploads[i].id === id) {
				return true
			}
		}

		return false
	}

	/**
	 *
	 */
	addUpload = (upload) => {
		let uploads = this.state.uploads

		uploads.unshift(upload)

		this.setState({uploads: uploads})

		window.localStorage.setItem('uploads', JSON.stringify(uploads))
	}

	/**
	 *
	 */
	removeUpload = (id) => {
		let uploads = this.state.uploads

		for (let i; i < uploads.length; i++) {
			if (uploads[i].id === id) {
				uploads.splice(i, 1)

				break
			}
		}

		this.setState({uploads: uploads})

		window.localStorage.setItem('uploads', JSON.stringify(uploads))
	}

	/**
	 *
	 */
	componentWillMount = () => {
		this.restoreUploads()

		electron.ipcRenderer.on('start-upload', (event, url) => {
			const template = this.buildCurrentUploadTemplate(url)

			if (this.uploadExists(template.id)) {
				alert('This folder (' + template.folderName + ') is currently being uploaded!')

				return
			}

			this.setState({uploadTemplate: template})

			document.getElementById('uploads').style.display = 'none'
			document.getElementById('uploader').style.display = 'block'
			document.getElementById('info').style.display = 'none'
			document.getElementById('upload').style.display = 'block'
		})

		electron.ipcRenderer.on('can-i-close', (event) => {
			const canClose = this.state.uploads.length === 0 || window.confirm('You have active uploads. Do you really want to quit?')

			event.sender.send('can-i-close-reply', canClose)
		})
	}

	/**
	 *
	 */
	render = () => {
		return (
			<React.Fragment>
				<Uploader addUpload={this.addUpload} uploadTemplate={this.state.uploadTemplate} />
				<Uploads uploads={this.state.uploads} removeUpload={this.removeUpload} />
			</React.Fragment>
		)
	}
}

export default App
