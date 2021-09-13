<script>
  import { Route, router } from 'tinro';

  import About from './components/About.svelte';
  import Home from './components/Home.svelte';
  import Contacts from './components/Contacts.svelte';
  // import SubContent from './components/SubContent.svelte';
  import Transition from './Transition.svelte'; 
</script>

<Transition>
  <Route path="/" redirect="/home" ></Route>
  <Route path="/home"><Home /> </Route>
  <Route path="/about/*">
    <About />
    <!-- <Route path="/sub">
      <SubContent />
    </Route> -->       
  </Route>
  <Route path="/contacts"><Contacts /></Route>
  <Route fallback>No page found</Route>
</Transition> 