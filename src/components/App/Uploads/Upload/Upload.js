import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import buildTar from '../../../../helpers/buildTar'
import notify from '../../../../helpers/notify'
import './Upload.scss'

const fs   = window.require('fs')
const path = window.require('path')
const tus  = window.require('tus-js-client')

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

			const file = fs.createReadStream(tar);
			const size = fs.statSync(tar).size;

			const options = {
				endpoint: this.props.data.uploadUrl,
				resume: true,
				uploadSize: size,
				metadata: {
					filename: path.basename(tar),
					userId: this.props.data.meta.userId,
					unitId: this.props.data.meta.unitId,
					folderName: this.props.data.folderName
				},
				onError: (error) => {
					throw error
				},
				onProgress: (bytesUploaded, bytesTotal) => {
					this.setState({uploadPercent: Math.round(bytesUploaded / bytesTotal * 100)})
				},
				onSuccess: () => {
					this.props.removeUpload(this.props.data.id)

					notify(this.props.data.folderName + ' has been uploaded')

					fs.unlink(tar)
				}
			}

			const upload = new tus.Upload(file, options)

			upload.start()
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
