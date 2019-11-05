import React, { Component } from 'react'

const electron = window.require('electron')

class Settings extends Component {
	close = () => {
		electron.ipcRenderer.send('close-settings')
	}

	render = () => {
		return (
			<div>
				<div>Hello</div>
				<button onClick={this.close}>close</button>
			</div>
		)
	}
}

export default Settings
