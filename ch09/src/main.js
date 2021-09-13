import App from './App.svelte';
import './style/style.css';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;