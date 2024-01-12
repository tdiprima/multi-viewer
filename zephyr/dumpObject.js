import * as THREE from 'three';

export function dumpObject(obj, lines = [], isLast = true, prefix = '') {
  const localPrefix = isLast ? '└─' : '├─';
  lines.push(`${prefix}${prefix ? localPrefix : ''}${obj.name || 'unnamed'} [${obj.type}]`);
  const newPrefix = prefix + (isLast ? '  ' : '│ ');
  const lastNdx = obj.children.length - 1;
  obj.children.forEach((child, ndx) => {
    const isLast = ndx === lastNdx;
    dumpObject(child, lines, isLast, newPrefix);
  });
  return lines;
}

export function sceneDump(scene) {
  scene.children.forEach(child => {
    console.log(`%c${dumpObject(child).join('\n')}`, "color: #00ff00;");
  });
}

export function imageViewerDump(scene) {
  scene.children.forEach(child => {
    // CHILDREN OF ImageViewer INSTANCE
    if (child instanceof THREE.LOD) {
      console.log(child, "\nfound with children:\n", child.children);
      child.children.forEach((lodChild) => {
        console.log("Child type: ", lodChild.type);
        if (lodChild instanceof THREE.Mesh) {
          console.log("Mesh with geometry: ", lodChild.geometry);
        } else {
          console.log("Non-mesh child: ", lodChild);
        }
      });
    }
  });
}
