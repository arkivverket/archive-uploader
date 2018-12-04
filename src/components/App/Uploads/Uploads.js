import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Upload from './Upload/Upload'
import './Uploads.scss'

/**
 *
 */
class Uploads extends Component {
	/**
	 *
	 */
	closeActiveUploads = () => {
		document.getElementById('uploader').style.display = 'block'
		document.getElementById('uploads').style.display = 'none'
	}

	/**
	 *
	 */
	render = () => {
		const uploads = this.props.uploads.map((upload, index) => {
			return (
				<Upload key={index} data={upload} removeUpload={this.props.removeUpload} />
			)
		})

		return (
			<div id="uploads" className="uploads">
			<div className="header">
				<a className="button light" onClick={this.closeActiveUploads}>
					<FontAwesomeIcon fixedWidth icon="times" />
					<span>Close</span>
				</a>
			</div>
				<div id="upload-list" className="upload-list">
					{uploads}
				</div>
			</div>
		)
	}
}

export default Uploads;
