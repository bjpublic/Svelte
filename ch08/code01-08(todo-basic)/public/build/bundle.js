
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    // Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
    // at the end of hydration without touching the remaining nodes.
    let is_hydrating = false;
    function start_hydrating() {
        is_hydrating = true;
    }
    function end_hydrating() {
        is_hydrating = false;
    }
    function upper_bound(low, high, key, value) {
        // Return first index of value larger than input value in the range [low, high)
        while (low < high) {
            const mid = low + ((high - low) >> 1);
            if (key(mid) <= value) {
                low = mid + 1;
            }
            else {
                high = mid;
            }
        }
        return low;
    }
    function init_hydrate(target) {
        if (target.hydrate_init)
            return;
        target.hydrate_init = true;
        // We know that all children have claim_order values since the unclaimed have been detached
        const children = target.childNodes;
        /*
        * Reorder claimed children optimally.
        * We can reorder claimed children optimally by finding the longest subsequence of
        * nodes that are already claimed in order and only moving the rest. The longest
        * subsequence subsequence of nodes that are claimed in order can be found by
        * computing the longest increasing subsequence of .claim_order values.
        *
        * This algorithm is optimal in generating the least amount of reorder operations
        * possible.
        *
        * Proof:
        * We know that, given a set of reordering operations, the nodes that do not move
        * always form an increasing subsequence, since they do not move among each other
        * meaning that they must be already ordered among each other. Thus, the maximal
        * set of nodes that do not move form a longest increasing subsequence.
        */
        // Compute longest increasing subsequence
        // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
        const m = new Int32Array(children.length + 1);
        // Predecessor indices + 1
        const p = new Int32Array(children.length);
        m[0] = -1;
        let longest = 0;
        for (let i = 0; i < children.length; i++) {
            const current = children[i].claim_order;
            // Find the largest subsequence length such that it ends in a value less than our current value
            // upper_bound returns first greater value, so we subtract one
            const seqLen = upper_bound(1, longest + 1, idx => children[m[idx]].claim_order, current) - 1;
            p[i] = m[seqLen] + 1;
            const newLen = seqLen + 1;
            // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
            m[newLen] = i;
            longest = Math.max(newLen, longest);
        }
        // The longest increasing subsequence of nodes (initially reversed)
        const lis = [];
        // The rest of the nodes, nodes that will be moved
        const toMove = [];
        let last = children.length - 1;
        for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
            lis.push(children[cur - 1]);
            for (; last >= cur; last--) {
                toMove.push(children[last]);
            }
            last--;
        }
        for (; last >= 0; last--) {
            toMove.push(children[last]);
        }
        lis.reverse();
        // We sort the nodes being moved to guarantee that their insertion order matches the claim order
        toMove.sort((a, b) => a.claim_order - b.claim_order);
        // Finally, we move the nodes
        for (let i = 0, j = 0; i < toMove.length; i++) {
            while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
                j++;
            }
            const anchor = j < lis.length ? lis[j] : null;
            target.insertBefore(toMove[i], anchor);
        }
    }
    function append(target, node) {
        if (is_hydrating) {
            init_hydrate(target);
            if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
                target.actual_end_child = target.firstChild;
            }
            if (node !== target.actual_end_child) {
                target.insertBefore(node, target.actual_end_child);
            }
            else {
                target.actual_end_child = node.nextSibling;
            }
        }
        else if (node.parentNode !== target) {
            target.appendChild(node);
        }
    }
    function insert(target, node, anchor) {
        if (is_hydrating && !anchor) {
            append(target, node);
        }
        else if (node.parentNode !== target || (anchor && node.nextSibling !== anchor)) {
            target.insertBefore(node, anchor || null);
        }
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                start_hydrating();
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            end_hydrating();
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/components/TodoHeader.svelte generated by Svelte v3.38.3 */

    const file$4 = "src/components/TodoHeader.svelte";

    function create_fragment$4(ctx) {
    	let header;
    	let div;
    	let h1;
    	let t1;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			header = element("header");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "SVELTE TODO";
    			t1 = space();
    			input = element("input");
    			add_location(h1, file$4, 7, 4, 112);
    			attr_dev(input, "type", "text");
    			add_location(input, file$4, 8, 4, 142);
    			attr_dev(div, "class", "wrap");
    			add_location(div, file$4, 6, 2, 89);
    			add_location(header, file$4, 5, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			append_dev(header, div);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, input);
    			set_input_value(input, /*todoValue*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(
    						input,
    						"keyup",
    						function () {
    							if (is_function(/*handleTodoInputKeyup*/ ctx[1])) /*handleTodoInputKeyup*/ ctx[1].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*todoValue*/ 1 && input.value !== /*todoValue*/ ctx[0]) {
    				set_input_value(input, /*todoValue*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TodoHeader", slots, []);
    	let { todoValue } = $$props;
    	let { handleTodoInputKeyup } = $$props;
    	const writable_props = ["todoValue", "handleTodoInputKeyup"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoHeader> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		todoValue = this.value;
    		$$invalidate(0, todoValue);
    	}

    	$$self.$$set = $$props => {
    		if ("todoValue" in $$props) $$invalidate(0, todoValue = $$props.todoValue);
    		if ("handleTodoInputKeyup" in $$props) $$invalidate(1, handleTodoInputKeyup = $$props.handleTodoInputKeyup);
    	};

    	$$self.$capture_state = () => ({ todoValue, handleTodoInputKeyup });

    	$$self.$inject_state = $$props => {
    		if ("todoValue" in $$props) $$invalidate(0, todoValue = $$props.todoValue);
    		if ("handleTodoInputKeyup" in $$props) $$invalidate(1, handleTodoInputKeyup = $$props.handleTodoInputKeyup);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [todoValue, handleTodoInputKeyup, input_input_handler];
    }

    class TodoHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { todoValue: 0, handleTodoInputKeyup: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoHeader",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todoValue*/ ctx[0] === undefined && !("todoValue" in props)) {
    			console.warn("<TodoHeader> was created without expected prop 'todoValue'");
    		}

    		if (/*handleTodoInputKeyup*/ ctx[1] === undefined && !("handleTodoInputKeyup" in props)) {
    			console.warn("<TodoHeader> was created without expected prop 'handleTodoInputKeyup'");
    		}
    	}

    	get todoValue() {
    		throw new Error("<TodoHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todoValue(value) {
    		throw new Error("<TodoHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleTodoInputKeyup() {
    		throw new Error("<TodoHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleTodoInputKeyup(value) {
    		throw new Error("<TodoHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Constant = {
      ALL: 'all',
      ACTIVE: 'active',
      DONE: 'done'
    };

    /* src/components/TodoInfo.svelte generated by Svelte v3.38.3 */
    const file$3 = "src/components/TodoInfo.svelte";

    function create_fragment$3(ctx) {
    	let div1;
    	let span;
    	let t0;
    	let t1;
    	let t2;
    	let div0;
    	let button0;
    	let t4;
    	let button1;
    	let t6;
    	let button2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			t0 = text("COUNT: ");
    			t1 = text(/*todoCount*/ ctx[0]);
    			t2 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "ALL";
    			t4 = space();
    			button1 = element("button");
    			button1.textContent = "ACTIVE";
    			t6 = space();
    			button2 = element("button");
    			button2.textContent = "DONE";
    			add_location(span, file$3, 10, 2, 165);
    			attr_dev(button0, "class", "btn");
    			toggle_class(button0, "selected", /*viewMode*/ ctx[1] === Constant.ALL);
    			add_location(button0, file$3, 12, 4, 209);
    			attr_dev(button1, "class", "btn");
    			toggle_class(button1, "selected", /*viewMode*/ ctx[1] === Constant.ACTIVE);
    			add_location(button1, file$3, 13, 4, 342);
    			attr_dev(button2, "class", "btn");
    			toggle_class(button2, "selected", /*viewMode*/ ctx[1] === Constant.DONE);
    			add_location(button2, file$3, 14, 4, 483);
    			add_location(div0, file$3, 11, 2, 199);
    			attr_dev(div1, "class", "info");
    			add_location(div1, file$3, 9, 0, 142);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t4);
    			append_dev(div0, button1);
    			append_dev(div0, t6);
    			append_dev(div0, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(button2, "click", /*click_handler_2*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todoCount*/ 1) set_data_dev(t1, /*todoCount*/ ctx[0]);

    			if (dirty & /*viewMode, Constant*/ 2) {
    				toggle_class(button0, "selected", /*viewMode*/ ctx[1] === Constant.ALL);
    			}

    			if (dirty & /*viewMode, Constant*/ 2) {
    				toggle_class(button1, "selected", /*viewMode*/ ctx[1] === Constant.ACTIVE);
    			}

    			if (dirty & /*viewMode, Constant*/ 2) {
    				toggle_class(button2, "selected", /*viewMode*/ ctx[1] === Constant.DONE);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TodoInfo", slots, []);
    	let { todoCount } = $$props;
    	let { viewMode } = $$props;
    	let { handleChangeViewMode } = $$props;
    	const writable_props = ["todoCount", "viewMode", "handleChangeViewMode"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoInfo> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => handleChangeViewMode(Constant.ALL);
    	const click_handler_1 = () => handleChangeViewMode(Constant.ACTIVE);
    	const click_handler_2 = () => handleChangeViewMode(Constant.DONE);

    	$$self.$$set = $$props => {
    		if ("todoCount" in $$props) $$invalidate(0, todoCount = $$props.todoCount);
    		if ("viewMode" in $$props) $$invalidate(1, viewMode = $$props.viewMode);
    		if ("handleChangeViewMode" in $$props) $$invalidate(2, handleChangeViewMode = $$props.handleChangeViewMode);
    	};

    	$$self.$capture_state = () => ({
    		Constant,
    		todoCount,
    		viewMode,
    		handleChangeViewMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("todoCount" in $$props) $$invalidate(0, todoCount = $$props.todoCount);
    		if ("viewMode" in $$props) $$invalidate(1, viewMode = $$props.viewMode);
    		if ("handleChangeViewMode" in $$props) $$invalidate(2, handleChangeViewMode = $$props.handleChangeViewMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		todoCount,
    		viewMode,
    		handleChangeViewMode,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class TodoInfo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
    			todoCount: 0,
    			viewMode: 1,
    			handleChangeViewMode: 2
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoInfo",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todoCount*/ ctx[0] === undefined && !("todoCount" in props)) {
    			console.warn("<TodoInfo> was created without expected prop 'todoCount'");
    		}

    		if (/*viewMode*/ ctx[1] === undefined && !("viewMode" in props)) {
    			console.warn("<TodoInfo> was created without expected prop 'viewMode'");
    		}

    		if (/*handleChangeViewMode*/ ctx[2] === undefined && !("handleChangeViewMode" in props)) {
    			console.warn("<TodoInfo> was created without expected prop 'handleChangeViewMode'");
    		}
    	}

    	get todoCount() {
    		throw new Error("<TodoInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todoCount(value) {
    		throw new Error("<TodoInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get viewMode() {
    		throw new Error("<TodoInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set viewMode(value) {
    		throw new Error("<TodoInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleChangeViewMode() {
    		throw new Error("<TodoInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleChangeViewMode(value) {
    		throw new Error("<TodoInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    function flip(node, animation, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src/components/TodoItem.svelte generated by Svelte v3.38.3 */

    const file$2 = "src/components/TodoItem.svelte";

    // (17:0) {:else}
    function create_else_block(ctx) {
    	let span;
    	let t_value = /*todo*/ ctx[0].content + "";
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$2, 17, 2, 430);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "dblclick", /*dblclick_handler*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*todo*/ 1 && t_value !== (t_value = /*todo*/ ctx[0].content + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(17:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (15:0) {#if editMode === todo.id}
    function create_if_block(ctx) {
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			add_location(input, file$2, 15, 2, 325);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*todo*/ ctx[0].content);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[8]),
    					listen_dev(input, "focusout", /*focusout_handler*/ ctx[9], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*todo*/ 1 && input.value !== /*todo*/ ctx[0].content) {
    				set_input_value(input, /*todo*/ ctx[0].content);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(15:0) {#if editMode === todo.id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let input;
    	let t0;
    	let t1;
    	let a;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*editMode*/ ctx[3] === /*todo*/ ctx[0].id) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			if_block.c();
    			t1 = space();
    			a = element("a");
    			a.textContent = "X";
    			attr_dev(input, "type", "checkbox");
    			add_location(input, file$2, 9, 0, 191);
    			attr_dev(a, "href", "#null");
    			add_location(a, file$2, 19, 0, 515);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			input.checked = /*todo*/ ctx[0].done;
    			insert_dev(target, t0, anchor);
    			if_block.m(target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, a, anchor);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*input_change_handler*/ ctx[6]),
    					listen_dev(input, "click", /*click_handler*/ ctx[7], false, false, false),
    					listen_dev(a, "click", /*click_handler_1*/ ctx[11], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*todo*/ 1) {
    				input.checked = /*todo*/ ctx[0].done;
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(t1.parentNode, t1);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			if (detaching) detach_dev(t0);
    			if_block.d(detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(a);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TodoItem", slots, []);
    	let { todo } = $$props;
    	let { handleCheckTodo } = $$props;
    	let { handleRemoveTodo } = $$props;
    	let { editMode } = $$props;
    	let { handleEditTodoItem } = $$props;
    	let { handleChangeEditMode } = $$props;

    	const writable_props = [
    		"todo",
    		"handleCheckTodo",
    		"handleRemoveTodo",
    		"editMode",
    		"handleEditTodoItem",
    		"handleChangeEditMode"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoItem> was created with unknown prop '${key}'`);
    	});

    	function input_change_handler() {
    		todo.done = this.checked;
    		$$invalidate(0, todo);
    	}

    	const click_handler = () => handleCheckTodo(todo.id);

    	function input_input_handler() {
    		todo.content = this.value;
    		$$invalidate(0, todo);
    	}

    	const focusout_handler = () => {
    		handleEditTodoItem(todo);
    	};

    	const dblclick_handler = () => handleChangeEditMode(todo.id);
    	const click_handler_1 = () => handleRemoveTodo(todo.id);

    	$$self.$$set = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    		if ("handleCheckTodo" in $$props) $$invalidate(1, handleCheckTodo = $$props.handleCheckTodo);
    		if ("handleRemoveTodo" in $$props) $$invalidate(2, handleRemoveTodo = $$props.handleRemoveTodo);
    		if ("editMode" in $$props) $$invalidate(3, editMode = $$props.editMode);
    		if ("handleEditTodoItem" in $$props) $$invalidate(4, handleEditTodoItem = $$props.handleEditTodoItem);
    		if ("handleChangeEditMode" in $$props) $$invalidate(5, handleChangeEditMode = $$props.handleChangeEditMode);
    	};

    	$$self.$capture_state = () => ({
    		todo,
    		handleCheckTodo,
    		handleRemoveTodo,
    		editMode,
    		handleEditTodoItem,
    		handleChangeEditMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("todo" in $$props) $$invalidate(0, todo = $$props.todo);
    		if ("handleCheckTodo" in $$props) $$invalidate(1, handleCheckTodo = $$props.handleCheckTodo);
    		if ("handleRemoveTodo" in $$props) $$invalidate(2, handleRemoveTodo = $$props.handleRemoveTodo);
    		if ("editMode" in $$props) $$invalidate(3, editMode = $$props.editMode);
    		if ("handleEditTodoItem" in $$props) $$invalidate(4, handleEditTodoItem = $$props.handleEditTodoItem);
    		if ("handleChangeEditMode" in $$props) $$invalidate(5, handleChangeEditMode = $$props.handleChangeEditMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		todo,
    		handleCheckTodo,
    		handleRemoveTodo,
    		editMode,
    		handleEditTodoItem,
    		handleChangeEditMode,
    		input_change_handler,
    		click_handler,
    		input_input_handler,
    		focusout_handler,
    		dblclick_handler,
    		click_handler_1
    	];
    }

    class TodoItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			todo: 0,
    			handleCheckTodo: 1,
    			handleRemoveTodo: 2,
    			editMode: 3,
    			handleEditTodoItem: 4,
    			handleChangeEditMode: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoItem",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*todo*/ ctx[0] === undefined && !("todo" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'todo'");
    		}

    		if (/*handleCheckTodo*/ ctx[1] === undefined && !("handleCheckTodo" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'handleCheckTodo'");
    		}

    		if (/*handleRemoveTodo*/ ctx[2] === undefined && !("handleRemoveTodo" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'handleRemoveTodo'");
    		}

    		if (/*editMode*/ ctx[3] === undefined && !("editMode" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'editMode'");
    		}

    		if (/*handleEditTodoItem*/ ctx[4] === undefined && !("handleEditTodoItem" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'handleEditTodoItem'");
    		}

    		if (/*handleChangeEditMode*/ ctx[5] === undefined && !("handleChangeEditMode" in props)) {
    			console.warn("<TodoItem> was created without expected prop 'handleChangeEditMode'");
    		}
    	}

    	get todo() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set todo(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleCheckTodo() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleCheckTodo(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleRemoveTodo() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleRemoveTodo(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editMode() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editMode(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleEditTodoItem() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleEditTodoItem(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleChangeEditMode() {
    		throw new Error("<TodoItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleChangeEditMode(value) {
    		throw new Error("<TodoItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/TodoList.svelte generated by Svelte v3.38.3 */
    const file$1 = "src/components/TodoList.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (17:4) {#each fetchTodos as todo, index(todo)}
    function create_each_block(key_1, ctx) {
    	let li;
    	let todoitem;
    	let t;
    	let li_intro;
    	let li_outro;
    	let rect;
    	let stop_animation = noop;
    	let current;

    	todoitem = new TodoItem({
    			props: {
    				todo: /*todo*/ ctx[6],
    				handleCheckTodo: /*handleCheckTodo*/ ctx[1],
    				handleRemoveTodo: /*handleRemoveTodo*/ ctx[2],
    				editMode: /*editMode*/ ctx[3],
    				handleEditTodoItem: /*handleEditTodoItem*/ ctx[4],
    				handleChangeEditMode: /*handleChangeEditMode*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			li = element("li");
    			create_component(todoitem.$$.fragment);
    			t = space();
    			add_location(li, file$1, 17, 6, 410);
    			this.first = li;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			mount_component(todoitem, li, null);
    			append_dev(li, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const todoitem_changes = {};
    			if (dirty & /*fetchTodos*/ 1) todoitem_changes.todo = /*todo*/ ctx[6];
    			if (dirty & /*handleCheckTodo*/ 2) todoitem_changes.handleCheckTodo = /*handleCheckTodo*/ ctx[1];
    			if (dirty & /*handleRemoveTodo*/ 4) todoitem_changes.handleRemoveTodo = /*handleRemoveTodo*/ ctx[2];
    			if (dirty & /*editMode*/ 8) todoitem_changes.editMode = /*editMode*/ ctx[3];
    			if (dirty & /*handleEditTodoItem*/ 16) todoitem_changes.handleEditTodoItem = /*handleEditTodoItem*/ ctx[4];
    			if (dirty & /*handleChangeEditMode*/ 32) todoitem_changes.handleChangeEditMode = /*handleChangeEditMode*/ ctx[5];
    			todoitem.$set(todoitem_changes);
    		},
    		r: function measure() {
    			rect = li.getBoundingClientRect();
    		},
    		f: function fix() {
    			fix_position(li);
    			stop_animation();
    			add_transform(li, rect);
    		},
    		a: function animate() {
    			stop_animation();
    			stop_animation = create_animation(li, rect, flip, { duration: 300 });
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todoitem.$$.fragment, local);

    			add_render_callback(() => {
    				if (li_outro) li_outro.end(1);
    				if (!li_intro) li_intro = create_in_transition(li, fade, {});
    				li_intro.start();
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todoitem.$$.fragment, local);
    			if (li_intro) li_intro.invalidate();
    			li_outro = create_out_transition(li, slide, { duration: 100 });
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			destroy_component(todoitem);
    			if (detaching && li_outro) li_outro.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(17:4) {#each fetchTodos as todo, index(todo)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let ul;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = /*fetchTodos*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*todo*/ ctx[6];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(ul, file$1, 15, 2, 355);
    			attr_dev(div, "class", "main");
    			add_location(div, file$1, 14, 0, 334);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*fetchTodos, handleCheckTodo, handleRemoveTodo, editMode, handleEditTodoItem, handleChangeEditMode*/ 63) {
    				each_value = /*fetchTodos*/ ctx[0];
    				validate_each_argument(each_value);
    				group_outros();
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].r();
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, ul, fix_and_outro_and_destroy_block, create_each_block, null, get_each_context);
    				for (let i = 0; i < each_blocks.length; i += 1) each_blocks[i].a();
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("TodoList", slots, []);
    	let { fetchTodos } = $$props;
    	let { handleCheckTodo } = $$props;
    	let { handleRemoveTodo } = $$props;
    	let { editMode } = $$props;
    	let { handleEditTodoItem } = $$props;
    	let { handleChangeEditMode } = $$props;

    	const writable_props = [
    		"fetchTodos",
    		"handleCheckTodo",
    		"handleRemoveTodo",
    		"editMode",
    		"handleEditTodoItem",
    		"handleChangeEditMode"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<TodoList> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("fetchTodos" in $$props) $$invalidate(0, fetchTodos = $$props.fetchTodos);
    		if ("handleCheckTodo" in $$props) $$invalidate(1, handleCheckTodo = $$props.handleCheckTodo);
    		if ("handleRemoveTodo" in $$props) $$invalidate(2, handleRemoveTodo = $$props.handleRemoveTodo);
    		if ("editMode" in $$props) $$invalidate(3, editMode = $$props.editMode);
    		if ("handleEditTodoItem" in $$props) $$invalidate(4, handleEditTodoItem = $$props.handleEditTodoItem);
    		if ("handleChangeEditMode" in $$props) $$invalidate(5, handleChangeEditMode = $$props.handleChangeEditMode);
    	};

    	$$self.$capture_state = () => ({
    		fade,
    		slide,
    		flip,
    		TodoItem,
    		fetchTodos,
    		handleCheckTodo,
    		handleRemoveTodo,
    		editMode,
    		handleEditTodoItem,
    		handleChangeEditMode
    	});

    	$$self.$inject_state = $$props => {
    		if ("fetchTodos" in $$props) $$invalidate(0, fetchTodos = $$props.fetchTodos);
    		if ("handleCheckTodo" in $$props) $$invalidate(1, handleCheckTodo = $$props.handleCheckTodo);
    		if ("handleRemoveTodo" in $$props) $$invalidate(2, handleRemoveTodo = $$props.handleRemoveTodo);
    		if ("editMode" in $$props) $$invalidate(3, editMode = $$props.editMode);
    		if ("handleEditTodoItem" in $$props) $$invalidate(4, handleEditTodoItem = $$props.handleEditTodoItem);
    		if ("handleChangeEditMode" in $$props) $$invalidate(5, handleChangeEditMode = $$props.handleChangeEditMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		fetchTodos,
    		handleCheckTodo,
    		handleRemoveTodo,
    		editMode,
    		handleEditTodoItem,
    		handleChangeEditMode
    	];
    }

    class TodoList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			fetchTodos: 0,
    			handleCheckTodo: 1,
    			handleRemoveTodo: 2,
    			editMode: 3,
    			handleEditTodoItem: 4,
    			handleChangeEditMode: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TodoList",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*fetchTodos*/ ctx[0] === undefined && !("fetchTodos" in props)) {
    			console.warn("<TodoList> was created without expected prop 'fetchTodos'");
    		}

    		if (/*handleCheckTodo*/ ctx[1] === undefined && !("handleCheckTodo" in props)) {
    			console.warn("<TodoList> was created without expected prop 'handleCheckTodo'");
    		}

    		if (/*handleRemoveTodo*/ ctx[2] === undefined && !("handleRemoveTodo" in props)) {
    			console.warn("<TodoList> was created without expected prop 'handleRemoveTodo'");
    		}

    		if (/*editMode*/ ctx[3] === undefined && !("editMode" in props)) {
    			console.warn("<TodoList> was created without expected prop 'editMode'");
    		}

    		if (/*handleEditTodoItem*/ ctx[4] === undefined && !("handleEditTodoItem" in props)) {
    			console.warn("<TodoList> was created without expected prop 'handleEditTodoItem'");
    		}

    		if (/*handleChangeEditMode*/ ctx[5] === undefined && !("handleChangeEditMode" in props)) {
    			console.warn("<TodoList> was created without expected prop 'handleChangeEditMode'");
    		}
    	}

    	get fetchTodos() {
    		throw new Error("<TodoList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fetchTodos(value) {
    		throw new Error("<TodoList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleCheckTodo() {
    		throw new Error("<TodoList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleCheckTodo(value) {
    		throw new Error("<TodoList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleRemoveTodo() {
    		throw new Error("<TodoList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleRemoveTodo(value) {
    		throw new Error("<TodoList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get editMode() {
    		throw new Error("<TodoList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set editMode(value) {
    		throw new Error("<TodoList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleEditTodoItem() {
    		throw new Error("<TodoList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleEditTodoItem(value) {
    		throw new Error("<TodoList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get handleChangeEditMode() {
    		throw new Error("<TodoList>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set handleChangeEditMode(value) {
    		throw new Error("<TodoList>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Unique ID creation requires a high quality random # generator. In the browser we therefore
    // require the crypto API and do not support built-in fallback to lower quality random number
    // generators (like Math.random()).
    var getRandomValues;
    var rnds8 = new Uint8Array(16);
    function rng() {
      // lazy load so that environments that need to polyfill have a chance to do so
      if (!getRandomValues) {
        // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
        // find the complete implementation of crypto (msCrypto) on IE11.
        getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

        if (!getRandomValues) {
          throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
      }

      return getRandomValues(rnds8);
    }

    var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

    function validate(uuid) {
      return typeof uuid === 'string' && REGEX.test(uuid);
    }

    /**
     * Convert array of 16 byte values to UUID string format of the form:
     * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
     */

    var byteToHex = [];

    for (var i = 0; i < 256; ++i) {
      byteToHex.push((i + 0x100).toString(16).substr(1));
    }

    function stringify(arr) {
      var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      // Note: Be careful editing this code!  It's been tuned for performance
      // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
      var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
      // of the following:
      // - One or more input array values don't map to a hex octet (leading to
      // "undefined" in the uuid)
      // - Invalid input values for the RFC `version` or `variant` fields

      if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
      }

      return uuid;
    }

    function v4(options, buf, offset) {
      options = options || {};
      var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

      rnds[6] = rnds[6] & 0x0f | 0x40;
      rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

      if (buf) {
        offset = offset || 0;

        for (var i = 0; i < 16; ++i) {
          buf[offset + i] = rnds[i];
        }

        return buf;
      }

      return stringify(rnds);
    }

    /* src/App.svelte generated by Svelte v3.38.3 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let todoheader;
    	let updating_todoValue;
    	let t0;
    	let todoinfo;
    	let t1;
    	let todolist;
    	let current;

    	function todoheader_todoValue_binding(value) {
    		/*todoheader_todoValue_binding*/ ctx[12](value);
    	}

    	let todoheader_props = {
    		handleTodoInputKeyup: /*handleTodoInputKeyup*/ ctx[6]
    	};

    	if (/*todoValue*/ ctx[2] !== void 0) {
    		todoheader_props.todoValue = /*todoValue*/ ctx[2];
    	}

    	todoheader = new TodoHeader({ props: todoheader_props, $$inline: true });
    	binding_callbacks.push(() => bind(todoheader, "todoValue", todoheader_todoValue_binding));

    	todoinfo = new TodoInfo({
    			props: {
    				todoCount: /*todoCount*/ ctx[4],
    				viewMode: /*viewMode*/ ctx[0],
    				handleChangeViewMode: /*handleChangeViewMode*/ ctx[10]
    			},
    			$$inline: true
    		});

    	todolist = new TodoList({
    			props: {
    				fetchTodos: /*fetchTodos*/ ctx[1],
    				handleCheckTodo: /*handleCheckTodo*/ ctx[5],
    				handleRemoveTodo: /*handleRemoveTodo*/ ctx[7],
    				editMode: /*editMode*/ ctx[3],
    				handleChangeEditMode: /*handleChangeEditMode*/ ctx[8],
    				handleEditTodoItem: /*handleEditTodoItem*/ ctx[9]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(todoheader.$$.fragment);
    			t0 = space();
    			create_component(todoinfo.$$.fragment);
    			t1 = space();
    			create_component(todolist.$$.fragment);
    			attr_dev(div, "class", "app");
    			add_location(div, file, 103, 0, 1808);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(todoheader, div, null);
    			append_dev(div, t0);
    			mount_component(todoinfo, div, null);
    			append_dev(div, t1);
    			mount_component(todolist, div, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const todoheader_changes = {};

    			if (!updating_todoValue && dirty & /*todoValue*/ 4) {
    				updating_todoValue = true;
    				todoheader_changes.todoValue = /*todoValue*/ ctx[2];
    				add_flush_callback(() => updating_todoValue = false);
    			}

    			todoheader.$set(todoheader_changes);
    			const todoinfo_changes = {};
    			if (dirty & /*todoCount*/ 16) todoinfo_changes.todoCount = /*todoCount*/ ctx[4];
    			if (dirty & /*viewMode*/ 1) todoinfo_changes.viewMode = /*viewMode*/ ctx[0];
    			todoinfo.$set(todoinfo_changes);
    			const todolist_changes = {};
    			if (dirty & /*fetchTodos*/ 2) todolist_changes.fetchTodos = /*fetchTodos*/ ctx[1];
    			if (dirty & /*editMode*/ 8) todolist_changes.editMode = /*editMode*/ ctx[3];
    			todolist.$set(todolist_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(todoheader.$$.fragment, local);
    			transition_in(todoinfo.$$.fragment, local);
    			transition_in(todolist.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(todoheader.$$.fragment, local);
    			transition_out(todoinfo.$$.fragment, local);
    			transition_out(todolist.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(todoheader);
    			destroy_component(todoinfo);
    			destroy_component(todolist);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let todoCount;
    	let fetchTodos;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);

    	let todos = [
    		{
    			id: v4(),
    			content: "첫 번째 할일",
    			done: false
    		},
    		{
    			id: v4(),
    			content: "두 번째 할일",
    			done: false
    		},
    		{
    			id: v4(),
    			content: "세 번째 할일",
    			done: true
    		},
    		{
    			id: v4(),
    			content: "네 번째 할일",
    			done: false
    		}
    	];

    	let todoValue = "";
    	let editMode = "";
    	let viewMode = Constant.ALL;

    	function handleCheckTodo(id) {
    		$$invalidate(11, todos = todos.map(todo => {
    			if (todo.id === id) {
    				todo.done = !todo.done;
    			}

    			return todo;
    		}));
    	}

    	function addTodoItem() {
    		if (todoValue) {
    			const newTodo = {
    				id: v4(),
    				content: todoValue,
    				doen: false
    			};

    			$$invalidate(11, todos = [...todos, newTodo]);
    			$$invalidate(2, todoValue = "");
    		}
    	}

    	function handleTodoInputKeyup(e) {
    		if (e.keyCode === 13) {
    			// todoValue = e.target.value;
    			addTodoItem();
    		}
    	}

    	function handleRemoveTodo(id) {
    		$$invalidate(11, todos = todos.filter(todo => todo.id !== id));
    	}

    	function handleChangeEditMode(id) {
    		$$invalidate(3, editMode = id);
    	}

    	function handleEditTodoItem(editTodo) {
    		$$invalidate(11, todos = todos.map(todo => {
    			if (todo.id === editTodo.id) {
    				todo.content = editTodo.content;
    			}

    			return todo;
    		}));

    		closeEditMode();
    	}

    	function closeEditMode() {
    		$$invalidate(3, editMode = "");
    	}

    	function handleChangeViewMode(mode) {
    		$$invalidate(0, viewMode = mode);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function todoheader_todoValue_binding(value) {
    		todoValue = value;
    		$$invalidate(2, todoValue);
    	}

    	$$self.$capture_state = () => ({
    		TodoHeader,
    		TodoInfo,
    		TodoList,
    		Constant,
    		uuid: v4,
    		todos,
    		todoValue,
    		editMode,
    		viewMode,
    		handleCheckTodo,
    		addTodoItem,
    		handleTodoInputKeyup,
    		handleRemoveTodo,
    		handleChangeEditMode,
    		handleEditTodoItem,
    		closeEditMode,
    		handleChangeViewMode,
    		todoCount,
    		fetchTodos
    	});

    	$$self.$inject_state = $$props => {
    		if ("todos" in $$props) $$invalidate(11, todos = $$props.todos);
    		if ("todoValue" in $$props) $$invalidate(2, todoValue = $$props.todoValue);
    		if ("editMode" in $$props) $$invalidate(3, editMode = $$props.editMode);
    		if ("viewMode" in $$props) $$invalidate(0, viewMode = $$props.viewMode);
    		if ("todoCount" in $$props) $$invalidate(4, todoCount = $$props.todoCount);
    		if ("fetchTodos" in $$props) $$invalidate(1, fetchTodos = $$props.fetchTodos);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*todos*/ 2048) {
    			$$invalidate(1, fetchTodos = todos);
    		}

    		if ($$self.$$.dirty & /*viewMode, todos*/ 2049) {
    			{
    				if (viewMode === Constant.ALL) $$invalidate(1, fetchTodos = todos);
    				if (viewMode === Constant.ACTIVE) $$invalidate(1, fetchTodos = todos.filter(todo => todo.done === false));
    				if (viewMode === Constant.DONE) $$invalidate(1, fetchTodos = todos.filter(todo => todo.done === true));
    			}
    		}

    		if ($$self.$$.dirty & /*fetchTodos*/ 2) {
    			$$invalidate(4, todoCount = fetchTodos.length);
    		}
    	};

    	return [
    		viewMode,
    		fetchTodos,
    		todoValue,
    		editMode,
    		todoCount,
    		handleCheckTodo,
    		handleTodoInputKeyup,
    		handleRemoveTodo,
    		handleChangeEditMode,
    		handleEditTodoItem,
    		handleChangeViewMode,
    		todos,
    		todoheader_todoValue_binding
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
