<!-- Transition.svelte -->
<script>
    import { router } from 'tinro';
    import { fade, slide, fly } from 'svelte/transition';
</script>

{#key $router.path}
    <div in:fly="{{ x:300, duration: 400, delay:500}}" >
        <slot></slot>
    </div>
{/key}