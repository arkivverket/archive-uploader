import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import buildTar from '../../../../helpers/buildTar'
import './Upload.scss'

/**
 *
 */
class Upload extends Component {

	/**
	 *
	 */
	state = {
		buildingTar: true,
		uploadPercent: 0
	}

	/**
	 *
	 */
	componentWillMount = () => {
		buildTar(this.props.data.sourceDirectory, this.props.data.folderName).then((tar) => {
			this.setState({buildingTar: false})

			this.props.removeUpload(this.props.data.id)
		})
	}

	/**
	 *
	 */
	render = () => {
		return (
			<div className="upload">
				<div className="top-row">
					<div className="folder-name">{this.props.data.folderName}</div>
					<div className="cancel"></div>
				</div>
				<div className="bottom-row">
					<div className="source-directory">{this.props.data.sourceDirectory}</div>
					<div className="status-icon">
						{this.state.buildingTar === true &&
							<span title="Building archive">
								<FontAwesomeIcon fixedWidth pulse icon="circle-notch" />
							</span>
						}
						{this.state.buildingTar === false &&
							<span title="Uploading">
								<FontAwesomeIcon fixedWidth icon="upload" />
							</span>
						}
					</div>
				</div>
				<div className="progress">
					<div className="bar" style={{width: this.state.uploadPercent + `%`}}></div>
				</div>
			</div>
		)
	}
}

export default Upload
