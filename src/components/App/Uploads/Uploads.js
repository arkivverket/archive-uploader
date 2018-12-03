import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './Uploads.scss'

/**
 *
 */
class Uploads extends Component {
	/**
	 *
	 */
	closeActiveUploads() {
		document.getElementById('uploader').style.display = 'block'
		document.getElementById('uploads').style.display = 'none'
	}

	/**
	 *
	 */
	render() {
		return (
			<div id="uploads" className="uploads">
			<div className="header">
				<a className="button light" onClick={this.closeActiveUploads}>
					<FontAwesomeIcon fixedWidth icon="times" />
					<span>Close</span>
				</a>
			</div>
				Active Uploads
			</div>
		)
	}
}

export default Uploads;
