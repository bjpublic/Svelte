import Typewriter from 'typewriter-effect/dist/core';

function writer(node) {

  let txt = node.innerHTML;

  const typewriter = new Typewriter(node, {
    strings: txt,
    autoStart: true,
    loop: true,
    delay: 100,
  });
}

export default writer;
