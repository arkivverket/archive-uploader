import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Uploader.scss'

const fs = window.require('fs-extra')

/**
 *
 */
class Uploader extends Component {
	/**
	 *
	 */
	state = {
		dropZoneLabel: this.props.dropZoneLabel,
		buttonDisabled: true
	}

	/**
	 *
	 */
	onDragEnterHandler = (event) => {
		event.preventDefault()

		event.target.classList.add('active', 'animated')
	}

	/**
	 *
	 */
	onDragExitHandler = (event) => {
		event.preventDefault()

		event.target.classList.remove(...(this.state.dropZoneLabel === this.props.dropZoneLabel ? ['active', 'animated'] : ['animated']))
	}

	/**
	 *
	 */
	onDragOverHandler = (event) => {
		event.preventDefault()
	}

	/**
	 *
	 */
	validateUpload = (files) => {
		let success = true

		if (files.length > 1) {
			success = false

			alert('You can only upload a single item!')
		}

		if (success && !fs.statSync(files[0].path).isDirectory()) {
			success = false

			alert('You must upload a folder!')
		}

		if (this.props.uploadExists(files[0].path)) {
			success = false

			alert('This folder is already beeing uploaded!')
		}

		return success
	}

	/**
	 *
	 */
	onDropHandler = (event) => {
		event.preventDefault()

		event.target.classList.remove('animated')

		if (this.validateUpload(event.dataTransfer.files) === false) {
			event.target.classList.remove('active')

			this.setState({
				dropZoneLabel: this.props.dropZoneLabel,
				buttonDisabled: true
			})

			return
		}

		this.setState({
			dropZoneLabel: event.dataTransfer.files[0].path,
			buttonDisabled: false
		})
	}

	/**
	 *
	 */
	showActiveUploads = () => {
		document.getElementById('uploader').style.display = 'none'
		document.getElementById('uploads').style.display = 'block'
	}

	/**
	 *
	 */
	startUpload = () => {
		const upload = this.props.uploadTemplate

		upload.sourceDirectory = this.state.dropZoneLabel

		this.props.addUpload(upload)

		document.getElementById('info').style.display = 'flex'
		document.getElementById('upload').style.display = 'none'
		document.getElementById('dropzone').classList.remove('active')

		this.setState({
			dropZoneLabel: this.props.dropZoneLabel,
			buttonDisabled: true
		})
	}

	/**
	 *
	 */
	render = () => {
		return (
			<div id="uploader" className="uploader">
				<div className="header">
					<button className="button" onClick={this.showActiveUploads}>
						<FontAwesomeIcon fixedWidth icon="upload" />
						<span>Uploads</span>
					</button>
				</div>
				<div id="info" className="info">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
				</div>
				<div id="upload" className="upload">
					<div id="dropzone" className="dropzone"
						onDragEnter={this.onDragEnterHandler}
						onDragLeave={this.onDragExitHandler}
						onDragOver={this.onDragOverHandler}
						onDrop={this.onDropHandler}
					>
						{this.state.dropZoneLabel}
					</div>
					<button id="start-upload" onClick={this.startUpload} disabled={this.state.buttonDisabled}>Start upload</button>
				</div>
			</div>
		)
	}
}

Uploader.defaultProps = {
	dropZoneLabel: 'Drop the folder here'
}

export default Uploader
