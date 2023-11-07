import { writable, derived } from 'svelte/store'
import { modelConfigOptions } from '$lib/data/configuration.js'
import { requiredConfig } from '$lib/shared/stores/modelStore.js'

// const initConfigOptions = {}
// Object.keys(modelConfigOptions).forEach((key) => {
// 	initConfigOptions[key] = modelConfigOptions[key].value
// })

export const modelConfigValues = writable(modelConfigOptions)
export const modelConfig = derived(
	[requiredConfig, modelConfigValues],
	([$requiredConfig, $modelConfigValues]) => {
		$requiredConfig.forEach((key) => {
			$modelConfigValues[key].active = true
		})
		return $modelConfigValues
	}
)
