import tagalog from './scripts/tagalog.js'
import hanunoo from './scripts/hanunoo.js'
import buhid from './scripts/buhid.js'
import tagbanwa from './scripts/tagbanwa.js'

const scripts = {
	tagalog,
	hanunoo,
	buhid,
	tagbanwa,
}

const INITIAL_VOWEL_OFFSETS = {
	a: 0x00,
	e: 0x01,
	i: 0x01,
	o: 0x02,
	u: 0x02,
}

const VOWEL_OFFSETS = {
	a: null,
	e: 0x12,
	i: 0x12,
	o: 0x13,
	u: 0x13,
}

const replaceInitialVowelPair = scriptDef => vowel => {
	const { start, } = scriptDef
	return String
		.fromCodePoint(start + INITIAL_VOWEL_OFFSETS[vowel])
}

const replaceConsonantVowelPair = scriptDef => (consonant, vowel = '') => {
	const { start, consonantMappingOffsets, virama, } = scriptDef
	let { [vowel]: theVowelOffset = 0x14 } = VOWEL_OFFSETS

	if (!virama && vowel === '') {
		return ''
	}


	if (consonantMappingOffsets[consonant] === null) {
		return typeof INITIAL_VOWEL_OFFSETS[vowel] === 'number' ? String.fromCodePoint(start + INITIAL_VOWEL_OFFSETS[vowel]) : ''
	}

	const theConsonant = String.fromCodePoint(start + consonantMappingOffsets[consonant])
	const theVowel = theVowelOffset === null ? '' : String.fromCodePoint(start + theVowelOffset)

	return `${theConsonant}${theVowel}`
}

const convertPunctuation = s => (
	s
		// special characters
		.replace(/[\]_^[}{@#$%&*()<>+=|"'\/-]/g, '')
		// sentence ending characters
		.replace(/[.!?]+[ ]*/g, '᜶')
		// sentence subdivision characters (breath marks)
		.replace(/[,:;]+[ ]*/g, '᜵')
		// remove double spacing
		.replace(/[ ][ ]+/g, ' ')
)

const convertLoanwordCharacters = s => (
	s
		.replace(/c([aou])/g, (_, vowel) => `k${vowel}`)
		.replace(/c([ei])/g, (_, vowel) => `s${vowel}`)
		.replace(/f/g, 'p')
		.replace(/ñ/g, 'ny')
		.replace(/j/g, 'h')
		.replace(/qu([ei])/, (_, vowel) => `k${vowel}`)
		.replace(/qu([aou])/, (_, vowel) => `kuw${vowel}`)
		.replace(/v/g, 'b')
		.replace(/x/, 'ks')
		.replace(/z/g, 's')
)

const convertSpecialWords = s => (
	s
		.replace(/\bng\b/g, 'nang')
		.replace(/\bmga\b/g, 'manga')
)

const doConvertFromLatin = scriptDef => s => (
	s
		// perform main conversion
		.replace(
			/(ng|g|b|k|[rd]|h|l|m|n|p|s|t|w|y)(a|[ei]|[ou])?/g,
			(_, ...args) => replaceConsonantVowelPair(scriptDef)(...args),
		)
		.replace(
			/(a|[ei]|[ou])/g,
			(_, ...args) => replaceInitialVowelPair(scriptDef)(...args),
		)
)

export default (s, { script = 'tagalog', } = {}) => (
	doConvertFromLatin(scripts[script])(
		convertSpecialWords(
			convertLoanwordCharacters(
				convertPunctuation(
					s.toLowerCase()
				)
			)
		)
	)
)
