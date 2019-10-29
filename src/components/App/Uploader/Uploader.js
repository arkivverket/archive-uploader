import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { isDirectoryEmpty } from '../../../helpers/fsHelpers'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Uploader.scss'

const electron = window.require('electron')
const fs       = window.require('fs-extra')

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
	gotoDigitisation = () => {
		electron.shell.openExternal('https://digitalisering.arkivverket.no')
	}

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

			alert('Du kan bare laste opp en mappe av gangen!')
		}

		const path = typeof(files[0]) === 'object' ? files[0].path : files[0]

		if (success && !fs.statSync(path).isDirectory()) {
			success = false

			alert('Du må laste opp en mappe!')
		}

		if (success && isDirectoryEmpty(path)) {
			success = false

			alert('Mappen må inneholde minst en fil!')
		}

		return success
	}

	/**
	 *
	 */
	fileDialog = () => {
		electron.remote.dialog.showOpenDialog({properties: ['openDirectory']}).then((result) => {
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
		const upload = this.props.uploadTemplate

		upload.sourceDirectory = this.state.dropzoneTarget

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
						<span>Opplastinger</span>
					</button>
				</div>
				<div id="info" className="info">
					<div className="message">
						<b>Uploader er klar til bruk!</b>
						<p>For å laste opp innhold må du starte arbeid på en enhet i webapplikasjonen <span className="link" onClick={this.gotoDigitisation}>Arkivdigitalisering</span>, og følge instruksjonene der.</p>
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
								Dra og slipp mappen her, eller <span className="link" onClick={this.fileDialog}>bla gjennom filer</span>.
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
						Start opplasting
					</button>
				</div>
			</div>
		)
	}
}

Uploader.propTypes = {
	addUpload: PropTypes.func,
	uploadTemplate: PropTypes.object
}

export default Uploader
