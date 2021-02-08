import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import buildTar from '../../../../helpers/buildTar'
import './Upload.scss'

const electron = window.require('electron')
const filesize = window.require('filesize')
const fs       = window.require('fs-extra')
const i18n     = window.require('i18n')
const md5      = window.require('md5')
const path     = window.require('path')
const Store    = window.require('electron-store')
const tus      = window.require('tus-js-client')

const initialState = {
	buildingTar: true,
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
	settings = null

	/**
	 *
	 */
	chunkSize = Infinity

	/**
	 *
	 */
	tarFilePath = null

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
	constructor(props) {
		super(props)

		this.settings = new Store()

		if (this.settings.get('limitChunkSize') !== false) {
			this.chunkSize = (1024 ** 2) * (this.settings.get('chunkSize') || 16)
		}

		if (this.props.data.uploadType === 'tar') {
			this.tarFilePath = this.props.data.source
		}
		else {
			let buildDirectory = this.settings.get('buildDirectory')

			if (buildDirectory === undefined || fs.existsSync(buildDirectory) === false) {
				buildDirectory = electron.remote.app.getPath('temp')
			}

			this.tarFilePath = path.join(buildDirectory, this.props.data.id + '.tar')
		}
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
	deleteTar = () => {
		if (fs.existsSync(this.tarFilePath) && this.props.data.uploadType === 'directory') {
			fs.unlinkSync(this.tarFilePath)
		}
	}

	/**
	 *
	 */
	uploadFile = (tar) => {
		let isFirstProgress = true

		const file   = fs.createReadStream(tar)
		const size   = fs.statSync(tar).size
		const fileId = md5(this.props.data.id + size)

		this.setState({
			buildingTar: false,
			fileId: fileId
		})

		const metadata = this.props.data.meta

		metadata.fileName = path.basename(tar)

		const options = {
			endpoint: this.props.data.uploadUrl,
			resume: true,
			uploadUrl: window.localStorage.getItem(fileId),
			uploadSize: size,
			chunkSize: this.chunkSize,
			metadata: metadata,
			onError: (error) => {
				this.setState({exception: error})
				this.deleteTar()
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

				electron.ipcRenderer.send('notification', i18n.__('Done'), this.props.data.reference + ' ' + i18n.__('has finished uploading!'))

				this.deleteTar()
			}
		}

		this.tusUpload = new tus.Upload(file, options)
		this.tusUpload.start()
	}

	/**
	 *
	 */
	startUpload = () => {
		if (this.props.data.uploadType === 'tar') {
			if (fs.existsSync(this.tarFilePath)) {
				this.uploadFile(this.tarFilePath)
			}
			else {
				this.props.removeUpload(this.props.data.id)
			}
		}
		else {
			if (fs.existsSync(this.tarFilePath)) {
				this.uploadFile(this.tarFilePath)
			}
			else {
				buildTar(this.props.data.source, this.tarFilePath).then((tar) => {
					this.uploadFile(tar)
				}).catch((error) => {
					this.setState({exception: error})
					this.deleteTar()
				})
			}
		}
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
		this.tusUpload = null
		this.resetState()
		this.startUpload()
	}

	/**
	 *
	 */
	cancelUpload = () => {
		if (window.confirm(i18n.__('Are you sure that you want to cancel the upload?'))) {
			if (this.tusUpload !== null) {
				this.tusUpload.abort()
			}

			clearTimeout(this.transferSpeed.timeout)

			if (this.state.fileId !== null) {
				window.localStorage.removeItem(this.state.fileId)
			}

			this.deleteTar()

			this.props.removeUpload(this.props.data.id)
		}
	}

	/**
	 *
	 */
	componentDidMount = () => {
		this.startUpload()
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
					<div className="source-directory" title={this.props.data.source}>
						{this.props.data.source}
					</div>
					<div className="controls">
						{this.state.buildingTar === true &&
							<span title={i18n.__('Preparing for upload')}>
								<FontAwesomeIcon fixedWidth pulse icon="circle-notch" />
							</span>
						}
						{this.state.buildingTar === false &&
							<div className="hoverable">
								<span onClick={this.toggleUpload} style={{marginRight: '.25em'}}>
									{this.state.isPaused === true &&
										<span title={i18n.__('Resume')}>
											<FontAwesomeIcon fixedWidth icon="play-circle" />
										</span>
									}
									{this.state.isPaused === false &&
										<span title={i18n.__('Pause')}>
											<FontAwesomeIcon fixedWidth icon="pause-circle" />
										</span>
									}
								</span>
								<span title={i18n.__('Cancel')}>
									<FontAwesomeIcon fixedWidth icon="times-circle" onClick={this.cancelUpload} />
								</span>
							</div>
						}
					</div>
				</div>
				<Tippy content={this.state.uploadPercent + '%'} disabled={this.state.buildingTar}>
					<div className="progress">
						<div className={`bar ${this.state.isPaused ? 'paused' : ''} ${this.state.isStalled ? 'stalled' : ''}`} style={{width: this.state.uploadPercent + '%'}}></div>
						{this.state.speed !== null && this.state.isPaused === false && this.state.isStalled === false &&
							<div className="speed">
								{filesize(this.state.speed, {bits: true, standard: 'iec'})}/sec
							</div>
						}
					</div>
				</Tippy>
				{this.state.exception !== null &&
					<Fragment>
						<div className="error">
							<div>
								{i18n.__('An error has occurred.')}
								<div className="details" title="Info">
									<FontAwesomeIcon fixedWidth icon="info-circle" onClick={this.toggleExceptionDetails} />
								</div>
								<div className="options">
									<span onClick={this.retryUpload}>{i18n.__('Retry')}</span>
									<span onClick={this.cancelUpload}>{i18n.__('Cancel')}</span>
								</div>
							</div>
						</div>
						{this.state.showExceptionDetails === true &&
							<div className="error-details">
								<div className="close" onClick={this.toggleExceptionDetails} title={i18n.__('Close')}>
									<FontAwesomeIcon fixedWidth icon="times" />
								</div>
								<div className="details">
									{this.state.exception.message}
								</div>
							</div>
						}
					</Fragment>
				}
			</div>
		)
	}
}

Upload.propTypes = {
	data: PropTypes.object,
	removeUpload: PropTypes.func
}

export default Upload
