import React, { Component } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { isDirectoryEmpty } from '../../helpers/fsHelpers'
import Settings from './Settings/Settings'
import Uploader from './Uploader/Uploader'
import Uploads from './Uploads/Uploads'
import './App.scss'
import is from '../../helpers/is'

const electron = window.require('electron')
const fs       = window.require('fs-extra')
const md5      = window.require('md5')
const i18n     = window.require('i18n')

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
				let directory = uploads[i].source

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
			electron.ipcRenderer.send('set-badge-count', count)
		}
	}

	/**
	 *
	 */
	buildCurrentUploadTemplate = (payload) => {
		const data = JSON.parse(payload)

		return {
			id: md5(payload),
			reference: data.reference,
			uploadUrl: data.uploadUrl,
			uploadType: data.uploadType === undefined ? 'directory' : data.uploadType,
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
		electron.ipcRenderer.on('start-upload', (event, payload) => {
			const template = this.buildCurrentUploadTemplate(payload)

			if (this.uploadExists(template.id)) {
				alert(i18n.__('This ' + (template.uploadType === 'directory' ? 'directory' : 'file')) + ' (' + template.reference + ') ' + i18n.__('is already being uploaded!'))

				return
			}

			this.setState({uploadTemplate: template})

			document.getElementById('uploads').style.display = 'none'
			document.getElementById('uploader').style.display = 'block'
			document.getElementById('info').style.display = 'none'
			document.getElementById('upload').style.display = 'block'
		})

		electron.ipcRenderer.on('can-i-close', (event) => {
			const canClose = this.state.uploads.length === 0 || window.confirm(i18n.__('You have active uploads. Are you sure that you want to quit?'))

			event.sender.send('can-i-close-reply', canClose)
		})
	}

	/**
	 *
	 */
	render = () => {
		const key = this.state.uploadTemplate === null ? null : this.state.uploadTemplate.id

		return (
			<HashRouter>
				<Routes>
					<Route path="/settings" element={<Settings />} />
					<Route path="/" element={
						<>
							<Uploader addUpload={this.addUpload} upload={this.state.uploadTemplate} key={key} />
							<Uploads uploads={this.state.uploads} removeUpload={this.removeUpload} />
						</>
					} />
				</Routes>
			</HashRouter>
		)
	}
}

export default App
