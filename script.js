let objects = [];
let offsetX = 0;
let selected = -1;

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent('canvas-container');
    
    canvas.elt.addEventListener('contextmenu', e => e.preventDefault());
}

function draw() {
    background(220);
    orbitControl();
    lights();


    // Draw all objects
    for (let i = 0; i < objects.length; i++) {
        let obj = objects[i];
        push();
        translate(obj.x, obj.y, obj.z);
        rotateX(radians(obj.rx));
        rotateY(radians(obj.ry));
        rotateZ(radians(obj.rz));
        noStroke();
        fill(obj.color);
        if (obj.shape === 'box') {
            box(obj.size);
        } else if (obj.shape === 'sphere') {
            sphere(obj.size / 2);
        } else if (obj.shape === 'cylinder') {
            cylinder(obj.size / 2, obj.size);
        } else if (obj.shape === 'cone') {
            cone(obj.size / 2, obj.size);
        }
        pop();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Menu interactions
document.getElementById('addObject').addEventListener('click', function() {
    let shape = document.getElementById('shape').value;
    let size = parseInt(document.getElementById('size').value);
    let color = document.getElementById('color').value;
    let obj = {
        shape: shape,
        size: size,
        color: color,
        x: offsetX,
        y: 0,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0
    };
    objects.push(obj);
    offsetX += 100; // Offset each new object
    selected = -1;
    updateObjectList();
    updateEditMenu();
});

document.getElementById('clearObjects').addEventListener('click', function() {
    objects = [];
    offsetX = 0;
    selected = -1;
    updateObjectList();
    updateEditMenu();
});

document.getElementById('selectObject').addEventListener('change', function() {
    selected = parseInt(this.value);
    updateEditMenu();
});

function updateObjectList() {
    let select = document.getElementById('selectObject');
    select.innerHTML = '<option value="-1">None</option>';
    for (let i = 0; i < objects.length; i++) {
        let option = document.createElement('option');
        option.value = i;
        option.text = `Object ${i + 1} (${objects[i].shape})`;
        select.appendChild(option);
    }
}

function updateEditMenu() {
    let editMenu = document.getElementById('editMenu');
    let select = document.getElementById('selectObject');
    select.value = selected;
    if (selected >= 0) {
        let obj = objects[selected];
        document.getElementById('editX').value = obj.x;
        document.getElementById('editY').value = obj.y;
        document.getElementById('editZ').value = obj.z;
        document.getElementById('editRX').value = obj.rx;
        document.getElementById('editRY').value = obj.ry;
        document.getElementById('editRZ').value = obj.rz;
        document.getElementById('editColor').value = obj.color;
        editMenu.style.display = 'block';
    } else {
        editMenu.style.display = 'none';
    }
}

document.getElementById('applyEdit').addEventListener('click', function() {
    if (selected >= 0) {
        let obj = objects[selected];
        obj.x = parseFloat(document.getElementById('editX').value) || 0;
        obj.y = parseFloat(document.getElementById('editY').value) || 0;
        obj.z = parseFloat(document.getElementById('editZ').value) || 0;
        obj.rx = parseFloat(document.getElementById('editRX').value) || 0;
        obj.ry = parseFloat(document.getElementById('editRY').value) || 0;
        obj.rz = parseFloat(document.getElementById('editRZ').value) || 0;
        obj.color = document.getElementById('editColor').value;
    }
});

// Live update event listeners
document.getElementById('editX').addEventListener('input', function() {
    if (selected >= 0) {
        objects[selected].x = parseFloat(this.value) || 0;
    }
});
document.getElementById('editY').addEventListener('input', function() {
    if (selected >= 0) {
        objects[selected].y = parseFloat(this.value) || 0;
    }
});
document.getElementById('editZ').addEventListener('input', function() {
    if (selected >= 0) {
        objects[selected].z = parseFloat(this.value) || 0;
    }
});
document.getElementById('editRX').addEventListener('input', function() {
    if (selected >= 0) {
        objects[selected].rx = parseFloat(this.value) || 0;
    }
});
document.getElementById('editRY').addEventListener('input', function() {
    if (selected >= 0) {
        objects[selected].ry = parseFloat(this.value) || 0;
    }
});
document.getElementById('editRZ').addEventListener('input', function() {
    if (selected >= 0) {
        objects[selected].rz = parseFloat(this.value) || 0;
    }
});
document.getElementById('editColor').addEventListener('input', function() {
    if (selected >= 0) {
        objects[selected].color = this.value;
    }
});

document.getElementById('deleteObject').addEventListener('click', function() {
    if (selected >= 0) {
        objects.splice(selected, 1);
        selected = -1;
        updateObjectList();
        updateEditMenu();
    }
});