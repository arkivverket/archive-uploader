'use strict'

const Ajv = require('ajv').default

/**
 * Payload schema.
 *
 * @var object
 */
const schema = {
	$id: 'https://uploader.digitalisering.arkivverket.no/schema/payload.json',
	type: 'object',
	properties: {
		reference: {type: 'string'},
		uploadUrl: {type: 'string'},
		uploadType: {type: 'string', enum: ['tar', 'directory']},
		meta: {type: 'object'}
	},
	required: ['reference', 'uploadUrl'],
	additionalProperties: false
}

/**
 * Validates the URL payload.
 *
 * @param string payload The payload received from the URL
 * @return boolean
 */
const validatePayload = (payload) => {

	try {
		payload = JSON.parse(payload)
	}
	catch(e) {
		return false
	}

	const ajv = new Ajv()

	ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'))

	return ajv.validate(schema, payload)
}

module.exports = validatePayload
