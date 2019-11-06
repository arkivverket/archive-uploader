import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Upload from './Upload/Upload'
import './Uploads.scss'

const i18n = window.require('i18n')

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
						<span>{i18n.__('Close')}</span>
					</button>
				</div>
				{this.props.uploads.length === 0 &&
					<div className="no-uploads">
						<div className="message">
							{i18n.__('There are currently no active uploads.')}
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

Uploads.propTypes = {
	removeUpload: PropTypes.func,
	uploads: PropTypes.array
}

export default Uploads
