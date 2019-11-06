import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Tippy from '@tippy.js/react'
import 'tippy.js/dist/tippy.css'
import './Settings.scss'

const electron = window.require('electron')
const i18n     = window.require('i18n')
const {is}     = window.require('electron-util')

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

		this.settings = new (window.require('electron-store'))

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
		return this.settings.get('buildDirectory')
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
						<button onClick={this.close}>
							<FontAwesomeIcon fixedWidth icon="times" />
						</button>
					}
				</div>
				<div className="content">
					<p>{i18n.__('Tar build directory:')}</p>
					<Tippy content={this.state.buildDirectory || electron.remote.app.getPath('temp')}>
						<div className="faux-input">{this.state.buildDirectory || i18n.__('Default Temporary Directory')}</div>
					</Tippy>
				</div>
			</div>
		)
	}
}

export default Settings
