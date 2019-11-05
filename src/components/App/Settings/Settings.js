import React, { Component } from 'react'

const electron = window.require('electron')
const {is}     = window.require('electron-util')

class Settings extends Component {
	close = () => {
		electron.ipcRenderer.send('close-settings')
	}

	render = () => {
		return (
			<div>
				<div>Hello</div>
				{is.macos &&
					<button onClick={this.close}>close</button>
				}
			</div>
		)
	}
}

export default Settings
