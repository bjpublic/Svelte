<!-- <script>
    import {Route} from 'tinro'; 
</script>

<nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/contacts">Contacts</a>
</nav>

<Route path="/"><h1>Home Page</h1></Route>
<Route path="/about"><h1>About Page</h1></Route>
<Route path="/contacts"><h1>Contacts Page</h1></Route> -->

<script>
	import Router from './router.svelte';
	import Nav from './components/Nav.svelte';
</script>

<Nav />

<Router />

