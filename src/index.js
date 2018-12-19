import React from 'react'
import ReactDOM from 'react-dom'
import { library } from "@fortawesome/fontawesome-svg-core"
import { faCircleNotch, faInfoCircle, faPauseCircle, faPlayCircle, faTimes, faTimesCircle, faUpload } from "@fortawesome/free-solid-svg-icons"
import App from './components/App/App'
import './index.scss'

// Add icons to library

library.add(
	faCircleNotch,
	faInfoCircle,
	faPauseCircle,
	faPlayCircle,
	faTimes,
	faTimesCircle,
	faUpload
)

// Start the application

ReactDOM.render(<App />, document.getElementById('root'))
