import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import 'tippy.js/dist/tippy.css'
import './Settings.scss'

const {is}     = window.require('electron-util')
const electron = window.require('electron')
const fs       = window.require('fs-extra')
const i18n     = window.require('i18n')

/**
 *
 */
class Settings extends Component {
	/**
	 *
	 */
	state = {
		buildDirectory: null,
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

		this.settings = new (window.require('electron-store'))()

		this.state.buildDirectory = this.getBuildDirectory()
	}

	/**
	 *
	 */
	close = () => {
		electron.ipcRenderer.send('close-settings')
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
	pickBuildDirectory = () => {
		electron.remote.dialog.showOpenDialog({properties: ['openDirectory']}).then((result) => {
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
					<p>{i18n.__('Build Directory:')}</p>
					<div className="build-directory">
						<Tippy content={<div style={{wordBreak: 'break-all'}}>{this.state.buildDirectory || electron.remote.app.getPath('temp')}</div>}>
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
				</div>
			</div>
		)
	}
}

export default Settings
