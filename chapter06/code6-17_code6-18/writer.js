function writer(node) {
  let txt = node.innerHTML;
  node.innerHTML = "";
  let count = 0;
  let speed = 100;  

  const write = function() {
    if (count < txt.length) { // txt 글자 수만큼 실행
      node.innerHTML += txt.charAt(count);
      count++;
      setTimeout(() => write(node, speed), speed);
    }
  }

  write();
}

export default writer;
