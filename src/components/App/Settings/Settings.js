import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippyjs/react'
import 'tippy.js/dist/tippy.css'
import './Settings.scss'


const {is}     = window.require('electron-util')
const { ipcRenderer } = window.require('electron')
const fs       = window.require('fs-extra')
const i18n     = window.require('i18n')
const Store    = window.require('electron-store')

/**
 *
 */
class Settings extends Component {
	/**
	 *
	 */
	state = {
		buildDirectory: null,
		limitChunkSize: null,
		chunkSize: null,
	}

	/**
	 *
	 */
	settings = null

	/**
	 *
	 */
	constructor(props) {
		super(props)

		this.settings = new Store()

		this.state.buildDirectory = this.getBuildDirectory()

		this.state.limitChunkSize = this.getLimitChunkSize()

		this.state.chunkSize = this.getChunkSize()
	}

	/**
	 *
	 */
	close = () => {
		ipcRenderer.send('close-settings')
	}

	/**
	 *
	 */
	getBuildDirectory = () => {
		return this.settings.get('buildDirectory') || null
	}

	/**
	 *
	 */
	getLimitChunkSize = () => {
		return this.settings.get('limitChunkSize') !== false
	}

	/**
	 *
	 */
	getChunkSize = () => {
		return this.settings.get('chunkSize') || 16
	}

	/**
	 *
	 */
	pickBuildDirectory = () => {
		ipcRenderer.invoke('pick-build-directory').then((result) => {
			if (result.canceled === false && result.filePaths !== undefined) {
				fs.access(result.filePaths[0], fs.constants.W_OK, (error) => {
					if (!error) {
						this.settings.set('buildDirectory', result.filePaths[0])

						this.setState({buildDirectory: result.filePaths[0]})
					}
					else {
						alert(i18n.__('The chosen directory isn\'t writable!'))

						this.pickBuildDirectory()
					}
				})
			}
		})
	}

	/**
	 *
	 */
	resetBuildDirectory = () => {
		this.settings.delete('buildDirectory')

		this.setState({buildDirectory: null})
	}

	/**
	 *
	 */
	updateLimitChunkSize = () => {
		this.setState((prevState) => ({
			limitChunkSize: !prevState.limitChunkSize
		}), () => {
			this.settings.set('limitChunkSize', this.state.limitChunkSize)
		})
	}

	/**
	 *
	 */
	updateChunkSize = (event) => {
		this.setState({
			chunkSize: event.target.value
		}, () =>
		{
			this.settings.set('chunkSize', parseInt(this.state.chunkSize))
		})
	}

	/**
	 *
	 */
	render = () => {
		return (
			<div id="settings">
				<div className="settings-header">
					<span className="heading">{i18n.__('Preferences')}</span>
					{is.macos &&
						<button onClick={this.close} title={i18n.__('Close')}>
							<FontAwesomeIcon fixedWidth icon="times" />
						</button>
					}
				</div>
				<div className="content">
					<p>{i18n.__('Build Directory')}:</p>
					<div className="build-directory">
						<Tippy content={<div style={{wordBreak: 'break-all'}}>{this.state.buildDirectory || this.settings.get('tmpDirectory')}</div>}>
							<div className="faux-input" onClick={this.pickBuildDirectory}>
								{this.state.buildDirectory || i18n.__('Default Temporary Directory')}
							</div>
						</Tippy>
						{this.state.buildDirectory !== null &&
							<button onClick={this.resetBuildDirectory} title={i18n.__('Reset')}>
								<FontAwesomeIcon fixedWidth icon="times" />
							</button>
						}
					</div>
					<p className="small">{i18n.__('Location where the Uploader will build a tar-archive when uploading directories. Make sure the filesystem has enough space.')}</p>

					<hr />

					<p>{i18n.__('Limit chunk size')}:</p>

					<input type="checkbox" onChange={this.updateLimitChunkSize} checked={this.state.limitChunkSize}></input>

					{this.state.limitChunkSize &&
						<>
							<input type="range" min="1" max="1000" step="1" value={this.state.chunkSize} onChange={this.updateChunkSize} title={`${this.state.chunkSize} MiB`}></input>
							{this.state.chunkSize} MiB
						</>
					}

					{!this.state.limitChunkSize &&
						<span>{i18n.__('No limit.')}</span>
					}

					<p className="small">{i18n.__('The maximum size of a chunk in MiB which will be uploaded in a single request. This can be used when a server or proxy has a limit on how big request bodies may be.')}</p>
				</div>
			</div>
		)
	}
}

export default Settings
