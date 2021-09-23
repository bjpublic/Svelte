function draggable(node, positions) {

  let left = 50;
  let top = 50;
  let moving = false;
  
  left = positions.x;
  top = positions.y;

  node.style.left = `${left}px`;
  node.style.top = `${top}px`;

  const handleMouseDown = function() {
    moving = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }
  
  const handleMouseUp = function() {
    moving = false;
  }
  
  const handleMouseMove = function(event) {
    if(moving) {

      left += event.movementX;
      top += event.movementY;

      node.style.left = `${left}px`;
      node.style.top = `${top}px`;
    }
  }

  node.addEventListener('mousedown', handleMouseDown);
  
  return {

    destroy() {
      node.removeEventListener('mousedown', handleMouseDown);
      node.removeEventListener('mousemove', handleMouseMove);
      node.removeEventListener('mouseup', handleMouseUp);
    }
  } 
}
export default draggable;
