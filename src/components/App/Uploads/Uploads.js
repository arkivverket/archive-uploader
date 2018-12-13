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
		const uploads = this.props.uploads.map((upload) => {
			return (
				<Upload key={upload.id} data={upload} removeUpload={this.props.removeUpload} />
			)
		})

		return (
			<div id="uploads" className="uploads">
				<div className="header">
					<button className="button" onClick={this.closeActiveUploads}>
						<FontAwesomeIcon fixedWidth icon="times" />
						<span>Lukk</span>
					</button>
				</div>
				{this.props.uploads.length === 0 &&
					<div className="no-uploads">
						<div className="message">
							Det er ingenting som lastes opp akkurat nå.
						</div>
					</div>
				}
				{this.props.uploads.length !== 0 &&
					<div id="upload-list" className="upload-list">
						{uploads}
					</div>
				}
			</div>
		)
	}
}

export default Uploads
