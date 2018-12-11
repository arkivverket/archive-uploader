import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import buildTar from '../../../../helpers/buildTar'
import notify from '../../../../helpers/notify'
import './Upload.scss'
import 'tippy.js/dist/tippy.css'

const fs   = window.require('fs')
const md5  = window.require('md5')
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
		tarFilePath: null,
		fileId: null,
		uploadPercent: 0,
		isPaused: false
	}

	/**
	 *
	 */
	tusUpload = null

	/**
	 *
	 */
	componentWillMount = () => {
		buildTar(this.props.data.sourceDirectory, this.props.data.folderName).then((tar) => {
			let isFirstProgress = true

			const file   = fs.createReadStream(tar)
			const size   = fs.statSync(tar).size
			const fileId = md5(this.props.data.id + size)

			this.setState({
				buildingTar: false,
				tarFilePath: tar,
				fileId: fileId
			})

			const options = {
				endpoint: this.props.data.uploadUrl,
				resume: true,
				uploadUrl: window.localStorage.getItem(fileId),
				uploadSize: size,
				metadata: {
					userId: this.props.data.meta.userId,
					unitId: this.props.data.meta.unitId,
					fileName: path.basename(tar),
					folderName: this.props.data.folderName
				},
				onError: (error) => {
					throw error
				},
				onProgress: (bytesUploaded, bytesTotal) => {
					if (isFirstProgress) {
						window.localStorage.setItem(fileId, this.tusUpload.url)

						isFirstProgress = false
					}

					this.setState({uploadPercent:(bytesUploaded / bytesTotal * 100).toFixed(2)})
				},
				onSuccess: () => {
					this.props.removeUpload(this.props.data.id)

					window.localStorage.removeItem(fileId)

					notify(this.props.data.folderName + ' has been uploaded')

					fs.unlinkSync(tar)
				}
			}

			this.tusUpload = new tus.Upload(file, options)

			this.tusUpload.start()
		})
	}

	/**
	 *
	 */
	toggleUpload = () => {
		if (this.tusUpload !== null) {
			if (this.state.isPaused) {
				this.tusUpload.start()

				this.setState({isPaused: false})
			}
			else {
				this.tusUpload.abort()

				this.setState({isPaused: true})
			}
		}
	}

	/**
	 *
	 */
	cancelUpload = () => {
		if (window.confirm('Are you sure that you want to cancel the upload?')) {
			this.tusUpload.abort()

			this.setState({isPaused: true})

			fs.unlinkSync(this.state.tarFilePath)

			window.localStorage.removeItem(this.state.fileId)

			this.props.removeUpload(this.props.data.id)
		}
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
							<Tippy content="Building archive">
								<FontAwesomeIcon fixedWidth pulse icon="circle-notch" />
							</Tippy>
						}
						{this.state.buildingTar === false &&
							<React.Fragment>
								<span onClick={this.toggleUpload} style={{'margin-right': '.5em'}}>
									{this.state.isPaused === true &&
										<Tippy content="Resume">
											<FontAwesomeIcon fixedWidth icon="play-circle" />
										</Tippy>
									}
									{this.state.isPaused === false &&
										<Tippy content="Pause">
											<FontAwesomeIcon fixedWidth icon="pause-circle" />
										</Tippy>
									}
								</span>
								<Tippy content="Cancel">
									<FontAwesomeIcon fixedWidth icon="times-circle" onClick={this.cancelUpload} />
								</Tippy>
							</React.Fragment>
						}
					</div>
				</div>
				<div className="progress" onClick={this.toggleUpload}>
					<Tippy content={this.state.uploadPercent + `%`}>
						<div className={`bar ${this.state.isPaused ? 'paused' : ''}`} style={{width: this.state.uploadPercent + `%`}}></div>
					</Tippy>
				</div>
			</div>
		)
	}
}

export default Upload
