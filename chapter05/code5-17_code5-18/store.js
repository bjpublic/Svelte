import { readable } from 'svelte/store';

export const time = readable(new Date(), function start(set) {
  
  const setTime = setTimeout(() => {
    set(new Date());
  }, 1000);

  return function reset() {
    clearTime(setTime);
  };
});
