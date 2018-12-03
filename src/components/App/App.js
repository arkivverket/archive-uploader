import React, { Component } from 'react'
import { buildTar } from '../../helpers/TarBuilder'
import './App.scss'

const fs = window.require('fs-extra')

class App extends Component {
	/**
	 *
	 */
	onDragEnterHandler(event) {
		 event.stopPropagation()
	}
	/**
	 *
	 */
	onDragOverHandler(event) {
		event.preventDefault()
	}
	/**
	 *
	 */
	onDropHandler(event) {
		event.stopPropagation()

		if (event.dataTransfer.files.length > 1) {
			return alert('You can only upload a single folder!')
		}

		if(!fs.statSync(event.dataTransfer.files[0].path).isDirectory()) {
			return alert('You must upload a folder!')
		}

		buildTar(event.dataTransfer.files[0].path, 'foobar').then((path) => {
			alert('Tar created: ' + path)
		})
	}

	/**
	 *
	 */
	render() {
		/*const electron = window.require('electron')

		electron.ipcRenderer.on('start-upload', function(event, url)
		{
			console.log(url)
		})*/
		return (
			<div className="container">
				<div className="header">
					Active uploads (0)
				</div>
				<div className="dropzone" onDragEnter={this.onDragEnterHandler} onDragOver={this.onDragOverHandler} onDrop={this.onDropHandler}>
					Drop your folder here ...<br/><br/><br/>
				</div>
			</div>
		);
	}
}

export default App;
