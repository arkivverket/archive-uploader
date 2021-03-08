import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { isDirectoryEmpty } from '../../../helpers/fsHelpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Uploader.scss'

const fs       = window.require('fs-extra')
const i18n     = window.require('i18n')
const remote   = window.require('@electron/remote')

const initialState = {
	dropzoneTarget: null,
	dropzoneActive: false,
	dropzoneAnimated: false,
	buttonDisabled: true
}

/**
 *
 */
class Uploader extends Component {
	/**
	 *
	 */
	state = initialState

	/**
	 *
	 */
	resetState = () => {
		this.setState(initialState)
	}

	/**
	 *
	 */
	validateUpload = (files) => {
		let success = true

		if (files.length > 1) {
			success = false

			alert(i18n.__(`You can only upload one ${this.props.upload === 'directory' ? 'directory' : 'file'} at a time!`))
		}

		if (success) {
			const path = typeof(files[0]) === 'object' ? files[0].path : files[0]

			if (this.props.upload.uploadType === 'tar') {
				if (path.split('.').pop() !== 'tar') {
					success = false

					alert(i18n.__('You must upload a tar-file!'))
				}
			}
			else {
				if (success && !fs.statSync(path).isDirectory()) {
					success = false

					alert(i18n.__('You must upload a directory!'))
				}

				if (success && isDirectoryEmpty(path)) {
					success = false

					alert(i18n.__('The directory must contain at least one file!'))
				}
			}
		}

		return success
	}

	/**
	 *
	 */
	dialogProperties = () => {
		if (this.props.upload.uploadType === 'tar') {
			return {
				filters: [
					{name: 'Tar', extensions: ['tar']}
				],
				properties: ['openFile']
			}
		}

		return {
			properties: ['openDirectory']
		}
	}

	/**
	 *
	 */
	fileDialog = () => {
		remote.dialog.showOpenDialog(this.dialogProperties()).then((result) => {
			if (result.canceled === false && result.filePaths !== undefined) {
				if (!this.validateUpload(result.filePaths)) {
					this.fileDialog()
				}
				else {
					this.setState({
						dropzoneTarget: result.filePaths[0],
						dropzoneActive: true,
						buttonDisabled: false
					})
				}
			}
		})
	}

	/**
	 *
	 */
	onDragEnterHandler = (event) => {
		event.preventDefault()

		this.setState({
			dropzoneActive: true,
			dropzoneAnimated: true,
		})
	}

	/**
	 *
	 */
	onDragExitHandler = (event) => {
		event.preventDefault()

		if (event.relatedTarget === null || event.relatedTarget.closest('.dropzone') === null) {

			if (this.state.dropzoneTarget === null) {
				this.setState({
					dropzoneActive: false,
					dropzoneAnimated: false
				})
			}
			else {
				this.setState({dropzoneAnimated: false})
			}
		}
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
	onDropHandler = (event) => {
		event.preventDefault()

		if (this.validateUpload(event.dataTransfer.files) === false) {
			this.resetState()
		}
		else {
			this.setState({
				dropzoneTarget: event.dataTransfer.files[0].path,
				dropzoneAnimated: false,
				buttonDisabled: false
			})
		}
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
		const upload = this.props.upload

		upload.source = this.state.dropzoneTarget

		this.props.addUpload(upload)

		this.showActiveUploads()

		document.getElementById('info').style.display = 'flex'
		document.getElementById('upload').style.display = 'none'

		this.resetState()
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
						<span>{i18n.__('Uploads')}</span>
					</button>
				</div>
				<div id="info" className="info">
					<div className="message">
						<b>{i18n.__('Uploader is ready for use!')}</b>
						<p>{i18n.__('To upload content you must click on the link in the belonging web application and follow the instructions there.')}</p>
					</div>
				</div>
				<div id="upload" className="upload">
					<div id="dropzone" className={`dropzone ${this.state.dropzoneActive ? 'active' : ''} ${this.state.dropzoneAnimated ? 'animated' : ''}`}
						onDragEnter={this.onDragEnterHandler}
						onDragLeave={this.onDragExitHandler}
						onDragOver={this.onDragOverHandler}
						onDrop={this.onDropHandler}
					>
						{this.state.dropzoneTarget === null &&
							<div className="message">
								{i18n.__('Drag and drop the item you want to upload here, or')} <span className="link" onClick={this.fileDialog}>{i18n.__('browse the file system')}</span>.
							</div>
						}
						{this.state.dropzoneTarget !== null &&
							<Fragment>
								<div className="clear-target" onClick={this.resetState} title="Avbryt">
									<FontAwesomeIcon fixedWidth icon="times" />
								</div>
								<div className="message target" title={this.state.dropzoneTarget}>
									{this.state.dropzoneTarget}
								</div>
							</Fragment>
						}
					</div>
					<button id="start-upload" onClick={this.startUpload} disabled={this.state.buttonDisabled}>
						{i18n.__('Start upload')}
					</button>
				</div>
			</div>
		)
	}
}

Uploader.propTypes = {
	addUpload: PropTypes.func,
	upload: PropTypes.object
}

export default Uploader
