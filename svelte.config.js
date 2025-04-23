import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter(),
		paths: {
			base: ''  // ← important: empty string for root domain
		}
	}
};