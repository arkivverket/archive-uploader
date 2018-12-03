import React, { Component } from 'react'
import Uploader from './Uploader/Uploader'
import Uploads from './Uploads/Uploads'
import { library } from "@fortawesome/fontawesome-svg-core"
import { faTimes, faUpload } from "@fortawesome/free-solid-svg-icons"
import './App.scss'

const electron = window.require('electron')

// Add icons to library

library.add(
	faTimes,
	faUpload
)

// Register "start-upload" listener

electron.ipcRenderer.on('start-upload', function(event, url) {
	console.log(url)

	document.getElementById('uploader').style.display = 'block'
	document.getElementById('uploads').style.display = 'none'
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
	render() {
		return (
			<React.Fragment>
				<Uploader />
				<Uploads />
			</React.Fragment>
		);
	}
}

export default App;
