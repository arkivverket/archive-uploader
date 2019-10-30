import React, { Component, Fragment } from 'react'
import { isDirectoryEmpty } from '../../helpers/fsHelpers'
import Uploader from './Uploader/Uploader'
import Uploads from './Uploads/Uploads'
import './App.scss'

const electron = window.require('electron')
const fs       = window.require('fs-extra')
const md5      = window.require('md5')
const {is}     = window.require('electron-util')

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
	constructor(props) {
		super(props)

		let uploads = window.localStorage.getItem('uploads')

		if (uploads !== null) {
			uploads = JSON.parse(uploads)

			for (let i = 0; i < uploads.length; i++) {
				let directory = uploads[i].sourceDirectory

				if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory() || isDirectoryEmpty(directory)) {
					uploads.splice(i, 1)
				}
			}

			this.state.uploads = uploads

			window.localStorage.setItem('uploads', JSON.stringify(uploads))

			this.setBadgeCount(uploads.length)
		}
	}

	/**
	 *
	 */
	setBadgeCount = (count) => {
		if (!is.windows) {
			electron.remote.app.badgeCount = count
		}
	}

	/**
	 *
	 */
	buildCurrentUploadTemplate = (url) => {
		const data = JSON.parse(window.atob(url.split('//').pop()))

		return {
			id: md5(url),
			reference: data.reference,
			uploadUrl: data.uploadUrl,
			uploadType: data.uploadType === undefined ? 'folder' : data.uploadType,
			meta: data.meta || {}
		}
	}

	/**
	 *
	 */
	uploadExists = (id) => {
		for (let i = 0; i < this.state.uploads.length; i++) {
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

		this.setBadgeCount(uploads.length)
	}

	/**
	 *
	 */
	removeUpload = (id) => {
		let uploads = this.state.uploads

		for (let i = 0; i < uploads.length; i++) {
			if (uploads[i].id === id) {
				uploads.splice(i, 1)

				break
			}
		}

		this.setState({uploads: uploads})

		window.localStorage.setItem('uploads', JSON.stringify(uploads))

		this.setBadgeCount(uploads.length)
	}

	/**
	 *
	 */
	componentDidMount = () => {
		electron.ipcRenderer.on('start-upload', (event, url) => {
			const template = this.buildCurrentUploadTemplate(url)

			if (this.uploadExists(template.id)) {
				alert('Denne ' + (template.uploadType === 'folder' ? 'mappen' : 'filen') + ' (' + template.reference + ') er allerede under opplasting!')

				return
			}

			this.setState({uploadTemplate: template})

			document.getElementById('uploads').style.display = 'none'
			document.getElementById('uploader').style.display = 'block'
			document.getElementById('info').style.display = 'none'
			document.getElementById('upload').style.display = 'block'
		})

		electron.ipcRenderer.on('can-i-close', (event) => {
			const canClose = this.state.uploads.length === 0 || window.confirm('Du har pågående opplastinger. Er du sikker på at du vil avslutte?')

			event.sender.send('can-i-close-reply', canClose)
		})
	}

	/**
	 *
	 */
	render = () => {
		const key = this.state.uploadTemplate === null ? null : this.state.uploadTemplate.id

		return (
			<Fragment>
				<Uploader addUpload={this.addUpload} uploadTemplate={this.state.uploadTemplate} key={key} />
				<Uploads uploads={this.state.uploads} removeUpload={this.removeUpload} />
			</Fragment>
		)
	}
}

export default App
