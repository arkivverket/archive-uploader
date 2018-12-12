import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import buildTar from '../../../../helpers/buildTar'
import notify from '../../../../helpers/notify'
import './Upload.scss'
import 'tippy.js/dist/tippy.css'

const filesize = window.require('filesize')
const fs       = window.require('fs-extra')
const md5      = window.require('md5')
const path     = window.require('path')
const tus      = window.require('tus-js-client')

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
		speed: null,
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
	transferSpeed = {
		previousChunkTimestamp: null,
		previousBytesUploaded: 0,
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

			if (fs.existsSync(this.state.tarFilePath)) {
				fs.unlinkSync(this.state.tarFilePath)
			}

			window.localStorage.removeItem(this.state.fileId)

			this.props.removeUpload(this.props.data.id)
		}
	}

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

					let speed = null

					const timestamp = window.performance.now()

					if (isFirstProgress) {
						window.localStorage.setItem(fileId, this.tusUpload.url)

						isFirstProgress = false
					}
					else {
						const timeSinceLastProgress = timestamp - this.transferSpeed.previousChunkTimestamp
						const bytesUploadedSinceLastProgress = bytesUploaded - this.transferSpeed.previousBytesUploaded

						speed = filesize(bytesUploadedSinceLastProgress / (timeSinceLastProgress / 1000), {bits: true, standard: 'iec'}) + '/sec'
					}

					this.transferSpeed.previousChunkTimestamp = timestamp
					this.transferSpeed.previousBytesUploaded = bytesUploaded

					this.setState({
						speed: speed,
						uploadPercent:(bytesUploaded / bytesTotal * 100).toFixed(2)
					})
				},
				onSuccess: () => {
					this.props.removeUpload(this.props.data.id)

					window.localStorage.removeItem(fileId)

					notify(this.props.data.reference + ' has been uploaded')

					if (fs.existsSync(tar)) {
						fs.unlinkSync(tar)
					}
				}
			}

			this.tusUpload = new tus.Upload(file, options)

			this.tusUpload.start()
		})
	}

	/**
	 *
	 */
	render = () => {
		return (
			<div className="upload">
				<div className="top-row">
					<div className="reference" title={this.props.data.reference}>
						{this.props.data.reference}
					</div>
				</div>
				<div className="bottom-row">
					<div className="source-directory" title={this.props.data.sourceDirectory}>
						{this.props.data.sourceDirectory}
					</div>
					<div className="status-icon">
						{this.state.buildingTar === true &&
							<Tippy content="Building archive">
								<FontAwesomeIcon fixedWidth pulse icon="circle-notch" />
							</Tippy>
						}
						{this.state.buildingTar === false &&
							<React.Fragment>
								<span onClick={this.toggleUpload} style={{marginRight: '.5em'}}>
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
				<div className="progress">
					<Tippy content={this.state.uploadPercent + `%`}>
						<div className={`bar ${this.state.isPaused ? 'paused' : ''}`} style={{width: this.state.uploadPercent + `%`}}></div>
					</Tippy>
					{this.state.buildingTar === false && this.state.speed !== null && this.state.isPaused === false &&
						<div className="speed">
							{this.state.speed}
						</div>
					}
				</div>
			</div>
		)
	}
}

export default Upload
