import React from 'react'
import ReactDOM from 'react-dom'
import { library } from "@fortawesome/fontawesome-svg-core"
import { faTimes, faUpload } from "@fortawesome/free-solid-svg-icons"
import App from './components/App/App'
import './index.scss'

// Add icons to library

library.add(
	faTimes,
	faUpload
)

// Start the application

ReactDOM.render(<App />, document.getElementById('root'))
