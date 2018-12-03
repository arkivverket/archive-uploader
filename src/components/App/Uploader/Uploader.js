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
	onDragEnterHandler(event) {
		event.preventDefault()

		event.target.classList.add('active');
	}

	/**
	 *
	 */
	onDragExitHandler(event) {
		event.preventDefault()

		event.target.classList.remove('active');
	}

	/**
	 *
	 */
	onDragOverHandler(event) {
		event.preventDefault()
	}

	/**
	 *
	 */
	onDropHandler(event) {
		event.preventDefault()

		let error = false;

		if (event.dataTransfer.files.length > 1) {
			error = true;

			alert('You can only upload a single item!')
		}

		if (!error && !fs.statSync(event.dataTransfer.files[0].path).isDirectory()) {
			error = true;

			alert('You must upload a folder!')
		}

		if (error) {
			event.target.classList.remove('active');

			document.getElementById('start-upload').disabled = true;

			return;
		}

		console.log(event.dataTransfer.files[0].path)

		document.getElementById('start-upload').disabled = false;
	}

	/**
	 *
	 */
	showActiveUploads() {
		document.getElementById('uploader').style.display = 'none'
		document.getElementById('uploads').style.display = 'block'
	}

	/**
	 *
	 */
	render() {
		return (
			<div id="uploader" className="uploader">
				<div className="header">
					<a className="button" onClick={this.showActiveUploads}>
						<FontAwesomeIcon fixedWidth icon="upload" />
						<span>Uploads</span>
					</a>
				</div>
				<div id="info" className="info">
					Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
				</div>
				<div id="dropzone" className="dropzone">
					<div className="drop" onDragEnter={this.onDragEnterHandler} onDragLeave={this.onDragExitHandler} onDragOver={this.onDragOverHandler} onDrop={this.onDropHandler}>
						Drop the folder here
					</div>
					<button id="start-upload" disabled>Start upload</button>
				</div>
			</div>
		)
	}
}

export default Uploader;
