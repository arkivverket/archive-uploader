import React, { Component } from 'react'
import Uploader from './Uploader/Uploader'
import Uploads from './Uploads/Uploads'
import './App.scss'

const electron = window.require('electron')
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
		for (let key in this.state.uploads) {
			if (this.state.uploads[key].id === id) {
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
	}

	/**
	 *
	 */
	removeUpload = (id) => {
		let uploads = this.state.uploads

		for (let key in uploads) {
			if (uploads[key].id === id) {
				uploads.splice(key, 1)

				break
			}
		}

		this.setState({uploads: uploads})
	}

	/**
	 *
	 */
	componentWillMount = () => {
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
