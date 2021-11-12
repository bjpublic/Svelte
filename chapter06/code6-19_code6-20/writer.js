function writer(node, setSpeed) { // setSpeed를 인자로 받아옴
  let txt = node.innerHTML;
  node.innerHTML = ""
  let count = 0;
  let speed = setSpeed

  const write = function() {
    if(count < txt.length) {
      node.innerHTML += txt.charAt(count);
      count++;
      setTimeout(() => write(node, speed), speed);
    }
  }

  write()

  return {
    update(setSpeed) { // setSpeed의 변화 감지
      node.innerHTML = "";
      count = 0;
      speed = setSpeed
      write();
    }
  }
}

export default writer;
