import React, { Component } from 'react'
import Uploader from './Uploader/Uploader'
import Uploads from './Uploads/Uploads'
import './App.scss'

const electron = window.require('electron')

// Register "start-upload" listener

electron.ipcRenderer.on('start-upload', function(event, url) {
	console.log(url)

	document.getElementById('uploads').style.display = 'none'
	document.getElementById('uploader').style.display = 'block'
	document.getElementById('info').style.display = 'none'
	document.getElementById('dropzone').style.display = 'block'
})

/**
 *
 */
class App extends Component {
	/**
	 *
	 */
	render = () => {
		return (
			<React.Fragment>
				<Uploader />
				<Uploads />
			</React.Fragment>
		);
	}
}

export default App;
