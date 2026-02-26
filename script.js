let objects = [];
let offsetX = 0;
let selected = -1;
let globalLights = true;

function setup() {
    let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
    canvas.parent("canvas-container");

    canvas.elt.addEventListener("contextmenu", (e) => e.preventDefault());
    loadFromLocalStorage();
}

function draw() {
    background(220);
    orbitControl();

    if (globalLights) {
        lights();
    } else {
        noLights();
    }

    // Draw all objects
    for (let i = 0; i < objects.length; i++) {
        let obj = objects[i];
        let speed = 2; // gravity speed
        let bb = getBoundingBox(obj);

        // For each axis, try moving toward 0
        if (obj.gravity.x) {
            let targetX = moveTowardZero(obj.x, speed);
            let testObj = { ...obj, x: targetX };
            let testBB = getBoundingBox(testObj);

            // Check collision with other objects
            let blocked = false;
            for (let j = 0; j < objects.length; j++) {
                if (i === j) continue;
                let otherBB = getBoundingBox(objects[j]);
                if (isColliding(testBB, otherBB)) {
                    blocked = true;
                    break;
                }
            }
            if (!blocked) obj.x = targetX;
        }

        if (obj.gravity.y) {
            let targetY = moveTowardZero(obj.y, speed);
            let testObj = { ...obj, y: targetY };
            let testBB = getBoundingBox(testObj);
            let blocked = false;
            for (let j = 0; j < objects.length; j++) {
                if (i === j) continue;
                let otherBB = getBoundingBox(objects[j]);
                if (isColliding(testBB, otherBB)) {
                    blocked = true;
                    break;
                }
            }
            if (!blocked) obj.y = targetY;
        }

        if (obj.gravity.z) {
            let targetZ = moveTowardZero(obj.z, speed);
            let testObj = { ...obj, z: targetZ };
            let testBB = getBoundingBox(testObj);
            let blocked = false;
            for (let j = 0; j < objects.length; j++) {
                if (i === j) continue;
                let otherBB = getBoundingBox(objects[j]);
                if (isColliding(testBB, otherBB)) {
                    blocked = true;
                    break;
                }
            }
            if (!blocked) obj.z = targetZ;
        }
        push();
        translate(obj.x, obj.y, obj.z);
        rotateX(radians(obj.rx));
        rotateY(radians(obj.ry));
        rotateZ(radians(obj.rz));
        noStroke();
        fill(obj.color);

        if (obj.shape === "box") {
            box(obj.width, obj.height, obj.depth);
        } else if (obj.shape === "sphere") {
            sphere(obj.radius);
        } else if (obj.shape === "cylinder") {
            cylinder(obj.radius, obj.height);
        } else if (obj.shape === "cone") {
            cone(obj.radius, obj.height);
        }
        pop();
    }
    saveToLocalStorage();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function getBoundingBox(obj) {
    if (obj.shape === "box") {
        return {
            minX: obj.x - obj.width / 2,
            maxX: obj.x + obj.width / 2,
            minY: obj.y - obj.height / 2,
            maxY: obj.y + obj.height / 2,
            minZ: obj.z - obj.depth / 2,
            maxZ: obj.z + obj.depth / 2,
        };
    } else if (obj.shape === "sphere") {
        return {
            minX: obj.x - obj.radius,
            maxX: obj.x + obj.radius,
            minY: obj.y - obj.radius,
            maxY: obj.y + obj.radius,
            minZ: obj.z - obj.radius,
            maxZ: obj.z + obj.radius,
        };
    } else if (obj.shape === "cylinder" || obj.shape === "cone") {
        return {
            minX: obj.x - obj.radius,
            maxX: obj.x + obj.radius,
            minY: obj.y - obj.height / 2,
            maxY: obj.y + obj.height / 2,
            minZ: obj.z - obj.radius,
            maxZ: obj.z + obj.radius,
        };
    }
}

function isColliding(a, b) {
    return !(
        a.maxX <= b.minX ||
        a.minX >= b.maxX ||
        a.maxY <= b.minY ||
        a.minY >= b.maxY ||
        a.maxZ <= b.minZ ||
        a.minZ >= b.maxZ
    );
}

function moveTowardZero(value, speed) {
    if (value > 0) return max(0, value - speed);
    if (value < 0) return min(0, value + speed);
    return 0;
}

// Menu interactions
document.getElementById("addObject").addEventListener("click", function () {
    let shape = document.getElementById("shape").value;
    let size = parseInt(document.getElementById("size").value);
    let color = document.getElementById("color").value;
    let obj = {
        name: `Object ${objects.length + 1}`,
        shape: shape,
        color: color,
        x: offsetX,
        y: 0,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0,
        gravity: { x: false, y: false, z: false },
    };
    if (shape === "box") {
        obj.width = size;
        obj.height = size;
        obj.depth = size;
    } else if (shape === "sphere") {
        obj.radius = size / 2;
    } else if (shape === "cylinder") {
        obj.radius = size / 2;
        obj.height = size;
    } else if (shape === "cone") {
        obj.radius = size / 2;
        obj.height = size;
    }
    objects.push(obj);
    offsetX += 100; // Offset each new object
    selected = -1;
    updateObjectList();
    updateEditMenu();
});

document.getElementById("clearObjects").addEventListener("click", function () {
    objects = [];
    offsetX = 0;
    selected = -1;
    updateObjectList();
    updateEditMenu();
});

document.getElementById("globalLight").addEventListener("change", function () {
    globalLights = this.checked;
});

document.getElementById("selectObject").addEventListener("change", function () {
    selected = parseInt(this.value);
    updateEditMenu();
});

function updateObjectList() {
    let select = document.getElementById("selectObject");
    select.innerHTML = '<option value="-1">None</option>';
    for (let i = 0; i < objects.length; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = objects[i].name;
        select.appendChild(option);
    }
}

function updateEditMenu() {
    let editMenu = document.getElementById("editMenu");
    let select = document.getElementById("selectObject");
    select.value = selected;
    // Hide all dimension divs
    document.getElementById("boxDimensions").style.display = "none";
    document.getElementById("sphereDimensions").style.display = "none";
    document.getElementById("cylinderDimensions").style.display = "none";
    document.getElementById("coneDimensions").style.display = "none";
    if (selected >= 0) {
        let obj = objects[selected];
        document.getElementById("editName").value = obj.name;
        document.getElementById("editX").value = obj.x;
        document.getElementById("editY").value = obj.y;
        document.getElementById("editZ").value = obj.z;
        document.getElementById("editRX").value = obj.rx;
        document.getElementById("editRY").value = obj.ry;
        document.getElementById("editRZ").value = obj.rz;
        document.getElementById("editColor").value = obj.color;
        if (obj.shape === "box") {
            document.getElementById("boxDimensions").style.display = "block";
            document.getElementById("editWidth").value = obj.width;
            document.getElementById("editHeightBox").value = obj.height;
            document.getElementById("editDepth").value = obj.depth;
        } else if (obj.shape === "sphere") {
            document.getElementById("sphereDimensions").style.display = "block";
            document.getElementById("editRadiusSphere").value = obj.radius;
        } else if (obj.shape === "cylinder") {
            document.getElementById("cylinderDimensions").style.display = "block";
            document.getElementById("editRadiusCylinder").value = obj.radius;
            document.getElementById("editHeightCylinder").value = obj.height;
        } else if (obj.shape === "cone") {
            document.getElementById("coneDimensions").style.display = "block";
            document.getElementById("editRadiusCone").value = obj.radius;
            document.getElementById("editHeightCone").value = obj.height;
        }
        document.getElementById("gravityX").checked = obj.gravity.x;
        document.getElementById("gravityY").checked = obj.gravity.y;
        document.getElementById("gravityZ").checked = obj.gravity.z;
        editMenu.style.display = "block";
    } else {
        editMenu.style.display = "none";
    }
}

document.getElementById("applyEdit").addEventListener("click", function () {
    if (selected >= 0) {
        let obj = objects[selected];
        obj.name = document.getElementById("editName").value || obj.name;
        obj.x = parseFloat(document.getElementById("editX").value) || 0;
        obj.y = parseFloat(document.getElementById("editY").value) || 0;
        obj.z = parseFloat(document.getElementById("editZ").value) || 0;
        obj.rx = parseFloat(document.getElementById("editRX").value) || 0;
        obj.ry = parseFloat(document.getElementById("editRY").value) || 0;
        obj.rz = parseFloat(document.getElementById("editRZ").value) || 0;
        obj.color = document.getElementById("editColor").value;
        if (obj.shape === "box") {
            obj.width = parseFloat(document.getElementById("editWidth").value) || 10;
            obj.height = parseFloat(document.getElementById("editHeightBox").value) || 10;
            obj.depth = parseFloat(document.getElementById("editDepth").value) || 10;
        } else if (obj.shape === "sphere") {
            obj.radius = parseFloat(document.getElementById("editRadiusSphere").value) || 10;
        } else if (obj.shape === "cylinder") {
            obj.radius = parseFloat(document.getElementById("editRadiusCylinder").value) || 10;
            obj.height = parseFloat(document.getElementById("editHeightCylinder").value) || 10;
        } else if (obj.shape === "cone") {
            obj.radius = parseFloat(document.getElementById("editRadiusCone").value) || 10;
            obj.height = parseFloat(document.getElementById("editHeightCone").value) || 10;
        }
    }
});

// Live update event listeners
document.getElementById("editX").addEventListener("input", function () {
    if (selected >= 0) {
        objects[selected].x = parseFloat(this.value) || 0;
    }
});
document.getElementById("editY").addEventListener("input", function () {
    if (selected >= 0) {
        objects[selected].y = parseFloat(this.value) || 0;
    }
});
document.getElementById("editZ").addEventListener("input", function () {
    if (selected >= 0) {
        objects[selected].z = parseFloat(this.value) || 0;
    }
});
document.getElementById("editRX").addEventListener("input", function () {
    if (selected >= 0) {
        objects[selected].rx = parseFloat(this.value) || 0;
    }
});
document.getElementById("editRY").addEventListener("input", function () {
    if (selected >= 0) {
        objects[selected].ry = parseFloat(this.value) || 0;
    }
});
document.getElementById("editRZ").addEventListener("input", function () {
    if (selected >= 0) {
        objects[selected].rz = parseFloat(this.value) || 0;
    }
});
document.getElementById("editColor").addEventListener("input", function () {
    if (selected >= 0) {
        objects[selected].color = this.value;
    }
});

// Live update for name
document.getElementById("editName").addEventListener("input", function () {
    if (selected >= 0) {
        objects[selected].name = this.value;
        updateObjectList(); // Update dropdown immediately
    }
});

// Dimension live update listeners
document.getElementById("editWidth").addEventListener("input", function () {
    if (selected >= 0 && objects[selected].shape === "box") {
        objects[selected].width = parseFloat(this.value) || 10;
    }
});
document.getElementById("editHeightBox").addEventListener("input", function () {
    if (selected >= 0 && objects[selected].shape === "box") {
        objects[selected].height = parseFloat(this.value) || 10;
    }
});
document.getElementById("editDepth").addEventListener("input", function () {
    if (selected >= 0 && objects[selected].shape === "box") {
        objects[selected].depth = parseFloat(this.value) || 10;
    }
});
document.getElementById("editRadiusSphere").addEventListener("input", function () {
    if (selected >= 0 && objects[selected].shape === "sphere") {
        objects[selected].radius = parseFloat(this.value) || 10;
    }
});
document.getElementById("editRadiusCylinder").addEventListener("input", function () {
    if (selected >= 0 && objects[selected].shape === "cylinder") {
        objects[selected].radius = parseFloat(this.value) || 10;
    }
});
document.getElementById("editHeightCylinder").addEventListener("input", function () {
    if (selected >= 0 && objects[selected].shape === "cylinder") {
        objects[selected].height = parseFloat(this.value) || 10;
    }
});
document.getElementById("editRadiusCone").addEventListener("input", function () {
    if (selected >= 0 && objects[selected].shape === "cone") {
        objects[selected].radius = parseFloat(this.value) || 10;
    }
});
document.getElementById("editHeightCone").addEventListener("input", function () {
    if (selected >= 0 && objects[selected].shape === "cone") {
        objects[selected].height = parseFloat(this.value) || 10;
    }
});

document.getElementById("gravityX").addEventListener("change", function () {
    if (selected >= 0) objects[selected].gravity.x = this.checked;
});
document.getElementById("gravityY").addEventListener("change", function () {
    if (selected >= 0) objects[selected].gravity.y = this.checked;
});
document.getElementById("gravityZ").addEventListener("change", function () {
    if (selected >= 0) objects[selected].gravity.z = this.checked;
});

document.getElementById("deleteObject").addEventListener("click", function () {
    if (selected >= 0) {
        objects.splice(selected, 1);
        selected = -1;
        updateObjectList();
        updateEditMenu();
    }
});
function loadFromLocalStorage() {
    let data = localStorage.getItem("3dObjectsProject");
    if (data) {
        objects = JSON.parse(data);
        updateObjectList();
        updateEditMenu();
    }
}

function saveToLocalStorage() {
    localStorage.setItem("3dObjectsProject", JSON.stringify(objects));
}

document.getElementById("saveProject").addEventListener("click", function () {
    let dataStr = JSON.stringify(objects, null, 2);
    let blob = new Blob([dataStr], { type: "application/json" });
    let url = URL.createObjectURL(blob);

    let a = document.createElement("a");
    a.href = url;
    a.download = "3d_project.json";
    a.click();

    URL.revokeObjectURL(url);
});

document.getElementById("loadProject").addEventListener("click", function () {
    document.getElementById("fileLoader").click();
});

document.getElementById("fileLoader").addEventListener("change", function (event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function (e) {
        objects = JSON.parse(e.target.result);
        selected = -1;
        updateObjectList();
        updateEditMenu();
        saveToLocalStorage();
    };
    reader.readAsText(file);
});