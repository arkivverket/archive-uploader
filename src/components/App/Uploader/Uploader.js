import React, { Component } from 'react'
import { isDirectoryEmpty } from '../../../helpers/fsHelpers'
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
		dropZoneTarget: null,
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

		if (event.relatedTarget === null || event.target !== event.relatedTarget.parentElement) {
			event.target.classList.remove(...(this.state.dropZoneTarget === null ? ['active', 'animated'] : ['animated']))
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
	validateUpload = (files) => {
		let success = true

		if (files.length > 1) {
			success = false

			alert('Du kan bare laste opp en mappe av gangen!')
		}

		if (success && !fs.statSync(files[0].path).isDirectory()) {
			success = false

			alert('Du må laste opp en mape!')
		}

		if (success && isDirectoryEmpty(files[0].path)) {
			success = false

			alert('Mappen må inneholde minst en fil!')
		}

		return success
	}

	/**
	 *
	 */
	onDropHandler = (event) => {
		event.preventDefault()

		event.target.closest('.dropzone').classList.remove('animated')

		if (this.validateUpload(event.dataTransfer.files) === false) {
			event.target.closest('.dropzone').classList.remove('active')

			this.setState({
				dropZoneTarget: null,
				buttonDisabled: true
			})

			return
		}

		this.setState({
			dropZoneTarget: event.dataTransfer.files[0].path,
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

		upload.sourceDirectory = this.state.dropZoneTarget

		this.props.addUpload(upload)

		this.showActiveUploads()

		document.getElementById('info').style.display = 'flex'
		document.getElementById('upload').style.display = 'none'
		document.getElementById('dropzone').classList.remove('active')

		this.setState({
			dropZoneTarget: null,
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
						<span>Opplastinger</span>
					</button>
				</div>
				<div id="info" className="info">
					<div className="message">
						<b>Uploader er klar til bruk!</b>
						<p>For å laste opp innhold må du starte arbeid på en enhet i webapplikasjonen Arkivdigitalisering, og følge instruksjonene der.</p>
					</div>
				</div>
				<div id="upload" className="upload">
					<div id="dropzone" className="dropzone"
						onDragEnter={this.onDragEnterHandler}
						onDragLeave={this.onDragExitHandler}
						onDragOver={this.onDragOverHandler}
						onDrop={this.onDropHandler}
					>
						{this.state.dropZoneTarget === null &&
							<div className="placeholder">
								Dra og slipp mappen her.
							</div>
						}
						{this.state.dropZoneTarget !== null &&
							<div className="target" title={this.state.dropZoneTarget}>
								{this.state.dropZoneTarget}
							</div>
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

export default Uploader
