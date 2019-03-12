import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import buildTar from '../../../../helpers/buildTar'
import notify from '../../../../helpers/notify'
import './Upload.scss'

const filesize = window.require('filesize')
const fs       = window.require('fs-extra')
const md5      = window.require('md5')
const path     = window.require('path')
const tus      = window.require('tus-js-client')

const initialState = {
	buildingTar: true,
	tarFilePath: null,
	fileId: null,
	speed: null,
	isPaused: false,
	isStalled: false,
	uploadPercent: 0,
	exception: null,
	showExceptionDetails: false
}

/**
 *
 */
class Upload extends Component {
	/**
	 *
	 */
	state = initialState

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
		timeout: null,
	}

	/**
	 *
	 */
	resetState = () => {
		this.setState(initialState)
	}

	/**
	 *
	 */
	upload = () => {

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
					folderName: this.props.data.meta.folderName
				},
				onError: (error) => {
					this.setState({exception: error})
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

						speed = bytesUploadedSinceLastProgress / (timeSinceLastProgress / 1000)

						if (this.transferSpeed.timeout !== null) {
							clearTimeout(this.transferSpeed.timeout)
						}

						this.transferSpeed.timeout = setTimeout(() => {
							if (this.state.isPaused === false) {
								this.setState({isStalled: true})
							}
						}, 2000)
					}

					this.transferSpeed.previousChunkTimestamp = timestamp
					this.transferSpeed.previousBytesUploaded = bytesUploaded

					this.setState({
						speed: speed,
						isStalled: false,
						uploadPercent: (bytesUploaded / bytesTotal * 100).toFixed(2)
					})
				},
				onSuccess: () => {
					clearTimeout(this.transferSpeed.timeout)

					this.props.removeUpload(this.props.data.id)

					window.localStorage.removeItem(fileId)

					notify(this.props.data.reference + ' er ferdig opplastet!', {
						tag: this.props.data.id
					})

					if (fs.existsSync(tar)) {
						fs.unlinkSync(tar)
					}
				}
			}

			this.tusUpload = new tus.Upload(file, options)

			this.tusUpload.start()
		})
		.catch((error) => {
			this.setState({exception: error})
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
	toggleExceptionDetails = () => {
		this.setState({showExceptionDetails: this.state.showExceptionDetails ? false : true})
	}

	/**
	 *
	 */
	retryUpload = () => {
		this.resetState()
		this.upload()
	}

	/**
	 *
	 */
	cancelUpload = () => {
		if (window.confirm('Er du sikker på at du vil avbryte opplastingen?')) {
			this.tusUpload.abort()

			clearTimeout(this.transferSpeed.timeout)

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
	componentDidMount = () => {
		this.upload()
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
					<div className="controls">
						{this.state.buildingTar === true &&
							<span title="Klargjør for opplasting">
								<FontAwesomeIcon fixedWidth pulse icon="circle-notch" />
							</span>
						}
						{this.state.buildingTar === false &&
							<div className="hoverable">
								<span onClick={this.toggleUpload} style={{marginRight: '.25em'}}>
									{this.state.isPaused === true &&
										<span title="Fortsett">
											<FontAwesomeIcon fixedWidth icon="play-circle" />
										</span>
									}
									{this.state.isPaused === false &&
										<span title="Pause">
											<FontAwesomeIcon fixedWidth icon="pause-circle" />
										</span>
									}
								</span>
								<span title="Avbryt">
									<FontAwesomeIcon fixedWidth icon="times-circle" onClick={this.cancelUpload} />
								</span>
							</div>
						}
					</div>
				</div>
				<Tippy content={this.state.uploadPercent + `%`} isEnabled={this.state.buildingTar === false}>
					<div className="progress">
						<div className={`bar ${this.state.isPaused ? 'paused' : ''} ${this.state.isStalled ? 'stalled' : ''}`} style={{width: this.state.uploadPercent + `%`}}></div>
						{this.state.speed !== null && this.state.isPaused === false && this.state.isStalled === false &&
							<div className="speed">
								{filesize(this.state.speed, {bits: true, standard: 'iec'})}/sec
							</div>
						}
					</div>
				</Tippy>
				{this.state.exception !== null &&
					<React.Fragment>
						<div className="error">
							<div>
								En feil har oppstått.
								<div className="details" title="Info">
									<FontAwesomeIcon fixedWidth icon="info-circle" onClick={this.toggleExceptionDetails} />
								</div>
								<div className="options">
									<span onClick={this.retryUpload}>Prøv på nytt</span>
									<span onClick={this.cancelUpload}>Avbryt</span>
								</div>
							</div>
						</div>
						{this.state.showExceptionDetails === true &&
							<div className="error-details">
								<div className="close" onClick={this.toggleExceptionDetails} title="Lukk">
									<FontAwesomeIcon fixedWidth icon="times" />
								</div>
								<div className="details">
									{this.state.exception.message}
								</div>
							</div>
						}
					</React.Fragment>
				}
			</div>
		)
	}
}

export default Upload
