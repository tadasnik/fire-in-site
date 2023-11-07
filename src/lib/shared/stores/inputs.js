import { writable } from 'svelte/store'
import { inputNodes } from '$lib/data/inputNodes.js'

export const siteInputs = writable(inputNodes)
