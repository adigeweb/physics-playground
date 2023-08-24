document.querySelector(".create button.spawner.obj").addEventListener("click", () => {
    let obj = document.createElement("div");
    obj.className = "object";
    obj.setAttribute("draggable", true);
    obj.setAttribute("focus", true);
    obj.style.top = "75px";
    obj.style.left = "75px";
    obj.style.rotate = "0deg";
    obj.onclick = (event) => { objClick(event) };
    obj.ondragend = (event) => { dropHandler(event) };
    document.querySelector(".scene").appendChild(obj);
    positions.push({ x: "75px", y: "75px" });
    details.push({
        name: "Unnamed",
        color: "#FF0000",
        gravity: true,
        collision: true,
        rotate: "0deg"
    });
    times.push(1);
    inspect(obj);
    obj.click();
});

document.querySelector(".create button.spawner.wind").addEventListener("click", () => {
    const convert = {
        Left: 0,
        Right: 1,
        Top: 2,
        Bottom: 3
    }
    setTimeout(() => {
        document.querySelector("input#windpow").value = wind[convert[document.querySelector("select#winddir").value]]
        document.querySelector("select#winddir").addEventListener("change", () => {
            document.querySelector("input#windpow").value = wind[convert[document.querySelector("select#winddir").value]]
        });
    }, 1000);
    Swal.fire({
        title: "Set Winds",
        html: `
            <div class="formcont">
                <label>Direction: <select id="winddir">
                    <option val="l">Left</option>
                    <option val="r">Right</option>
                    <option val="t">Top</option>
                    <option val="b">Bottom</option>
                </select></label>
                <label>Power: <input type="number" id="windpow" /></label>
            </div>
        `,
        confirmButtonText: "Add",
        preConfirm: () => {
            return new Promise((resolve, reject) => {
                if (!typeof parseInt(document.querySelector("input#windpow").value) == "number" || isNaN(parseInt(document.querySelector("input#windpow").value))) {
                    Swal.showValidationMessage("Wind power should be a number!");
                    resolve({ error: true });
                }
                else if (parseInt(document.querySelector("input#windpow").value) < -100 || parseInt(document.querySelector("input#windpow").value) > 100) {
                    Swal.showValidationMessage("Wind power should be between -100 and 100");
                    resolve({ error: true });
                }
                resolve ([
                    document.querySelector("select#winddir").value,
                    parseInt(document.querySelector("input#windpow").value)
                ]);
            });
        }
    }).then(res => {
        if (!res.isConfirmed) return;
        else if (res.value.error) {
            Swal.enableConfirmButton();
        }
        else {
            wind[convert[res.value[0]]] = res.value[1];
        }
    });
});

var positions = [];
var times = [];
var details = [];
var wind = [0, 0, 0, 0];

document.querySelector("button.pause").click();

const objClick = (event) => {
    document.querySelectorAll(".object").forEach(item => item.removeAttribute("focus"));
    event.target.setAttribute("focus", true);
    inspect(event.target);
}

document.querySelector(".scene").addEventListener("click", (event) => {
    if (!(event.target.className == "object")) {
        document.querySelectorAll(".object[focus]").forEach(item => {
            item.removeAttribute("focus");
            document.querySelector(".inspector").setAttribute("empty", true);
        });
    }
});

const dropHandler = (event) => {
    const rect = event.target.getBoundingClientRect();
    const sceneRect = document.querySelector(".scene").getBoundingClientRect();
    if (
        event.clientX > sceneRect.right - rect.width ||
        event.clientX < sceneRect.left + rect.width ||
        event.clientY > sceneRect.bottom - rect.height ||
        event.clientY < sceneRect.top + rect.height
    ) return;
    const lastPos = [event.target.style.left, event.target.style.top];
    event.target.style.left = `${event.clientX - sceneRect.left - rect.width / 2}px`;
    event.target.style.top = `${event.clientY - sceneRect.top - rect.height / 2}px`;
    if (touches(event.target, document.querySelector(".ground"))) {
        event.target.style.left = lastPos[0];
        event.target.style.top = lastPos[1];
    }
    for (let i = 0; i < document.querySelectorAll(".object").length; i++) {
        const element = document.querySelectorAll(".object")[i];
        if (element == event.target) {
            positions[i] = { x: event.target.style.left, y: event.target.style.top };
            times[i] = 1;
            break;
        }
    }
}

const touches = (a, b) => {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();
    return !(
        ((aRect.top + aRect.height) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width))
    );
}

document.querySelector("button.start").addEventListener("click", () => {
    resuming = true;
    if (startInterval) return;
    startInterval = setInterval(() => {
        if (resuming) {
            document.querySelectorAll(".object").forEach((obj, index) => {
                const rect = obj.getBoundingClientRect();
                document.querySelectorAll(".object").forEach((childObj, childIndex) => {
                    if (childObj == obj) return;
                    if (details[index].collision && details[childIndex].collision && touches(childObj, obj)) {
                        const childRect = childObj.getBoundingClientRect();
                        var topObj;
                        var bottomObj;
                        Math.min(rect.top, childRect.top) == rect.top ? topObj = obj : topObj = childObj;
                        topObj == obj ? bottomObj = childObj : bottomObj = obj;
                        var topRect = topObj.getBoundingClientRect();
                        var bottomRect = bottomObj.getBoundingClientRect();
                        if (obj == bottomObj) {
                            obj.style.top = StringMath(obj.style.top, "px", times[index] / 10);
                        }
                        if (bottomRect.left - topRect.left > topRect.width / 2) rotSym = 1;
                        else rotSym = -1;
                        if ((bottomRect.left - topRect.left > topRect.width / 2 || topRect.left - bottomRect.left > topRect.width / 2) && touches(obj, childObj)) {
                            topObj.style.rotate = StringMath(topObj.style.rotate, "deg", 45 * rotSym);
                            if (topObj == obj) details[index].rotate = StringMath(topObj.style.rotate, "deg", (topRect.left - bottomRect.left) * rotSym);
                            else details[childIndex].rotate = StringMath(topObj.style.rotate, "deg", (topRect.left - bottomRect.left) * rotSym);
                        }
                        if (!(bottomRect.left - topRect.left > topRect.width / 2 || topRect.left - bottomRect.left > topRect.width / 2) && touches(obj, childObj) && !(parseInt(topObj.style.rotate.replaceAll("deg", "")) % 360 == 0)) {
                            topObj.style.left = StringMath(topObj.style.left, "px", 5 * -rotSym);
                        }
                        times[index] = 1;
                        return;
                    }
                });
                if (!touches(obj, document.querySelector(".ground")) && details[index].gravity && touches(obj, document.querySelector(".scene"))) {
                    if (!(
                        document.querySelector(".scene").getBoundingClientRect().right < obj.getBoundingClientRect().right ||
                        document.querySelector(".scene").getBoundingClientRect().left > obj.getBoundingClientRect().left ||
                        document.querySelector(".scene").getBoundingClientRect().bottom < obj.getBoundingClientRect().bottom ||
                        document.querySelector(".scene").getBoundingClientRect().top > obj.getBoundingClientRect().top
                    )) obj.style.top = StringMath(obj.style.top, "px", times[index] / 10);
                }
                else times[index] = 1;
                if (touches(obj, document.querySelector(".scene")) && !(document.querySelector(".ground").getBoundingClientRect().top < obj.getBoundingClientRect().top - obj.getBoundingClientRect().height / 2)) {
                    if (!(
                        document.querySelector(".scene").getBoundingClientRect().right < obj.getBoundingClientRect().right ||
                        document.querySelector(".scene").getBoundingClientRect().left > obj.getBoundingClientRect().left ||
                        document.querySelector(".scene").getBoundingClientRect().bottom < obj.getBoundingClientRect().bottom ||
                        document.querySelector(".scene").getBoundingClientRect().top > obj.getBoundingClientRect().top
                    )) {
                        obj.style.left = StringMath(obj.style.left, "px", wind[0] - wind[1]);
                        obj.style.top = StringMath(obj.style.top, "px", wind[3] - wind[2]);
                    }
                }
                times[index]++;
            });
        }
    }, 20);
});

document.querySelector("button.pause").addEventListener("click", () => {
    clearInterval(startInterval);
    startInterval = null;
});

document.querySelector("button.stop").addEventListener("click", () => {
    clearInterval(startInterval);
    startInterval = null;
    document.querySelectorAll(".object").forEach((obj, index) => {
       obj.style.left = positions[index].x;
       obj.style.top = positions[index].y;
    });
});

document.querySelector("button.download").addEventListener("click", () => {
    download(JSON.stringify({
        details: details,
        positions: positions,
        times: times,
        wind: wind
    }), `physics-playground.json`, "application/json");
});

document.querySelector("button.upload").addEventListener("click", () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", ".json");
    input.onchange = () => reader.readAsDataURL(input.files[0]);
    input.click();
    const reader = new FileReader();
    reader.onload = (event) => {
        fetch(event.target.result)
            .then(res => res.json())
            .then(data => {
                if (data && data["positions"] && data["times"] && data["details"]) {
                    document.querySelector(".menu.default span#ref").click();
                    positions = data["positions"];
                    times = data["times"];
                    details = data["details"];
                    wind = data["wind"];
                    Object.keys(positions).forEach((item, index) => {
                        const obj = document.createElement("div");
                        obj.className = "object";
                        obj.setAttribute("draggable", true);
                        obj.name = details[index].name;
                        obj.style.left = positions[index].x;
                        obj.style.top = positions[index].y;
                        obj.style.rotate = details[index].rotate;
                        obj.style.background = details[index].color;
                        obj.onclick = (event) => { objClick(event) };
                        obj.ondragend = (event) => { dropHandler(event) };
                        document.querySelector(".scene").appendChild(obj);
                    });
                }
                else {
                    alert("Invalid file!");
                }
            })
            .catch(error => {
                alert("An error has occured!")
                console.error(error);
            });
    }
});

var resuming = false;
var startInterval;

const StringMath = (val, prefix, change) => {
    return ((parseInt(val.replaceAll(prefix, "")))  + change).toString() + prefix;
}

const inspect = (item) => {
    document.querySelector(".inspector").removeAttribute("empty");
    document.querySelectorAll(".object").forEach((obj, index) => {
        if (obj == item) {
            document.querySelector(".inspector .details input#name").value = details[index].name;
            document.querySelector(".inspector .details label input#color").value = details[index].color;
            document.querySelector(".inspector .details label input#gravity").checked = details[index].gravity;
            document.querySelector(".inspector .details label input#collision").checked = details[index].collision;
        }
    });
    inspectorTarget = item;
}

document.querySelector(".inspector .details input#name").addEventListener("input", () => {
    document.querySelectorAll(".object").forEach((obj, index) => {
        if (obj.getAttribute("focus")) {
            details[index].name = document.querySelector(".inspector .details input#name").value;
            document.querySelector(".object[focus]").setAttribute("name", document.querySelector(".inspector .details input#name").value);
            return;
        }
    });
});

document.querySelector(".inspector .details input#color").addEventListener("input", () => {
    document.querySelectorAll(".object").forEach((obj, index) => {
        if (obj.getAttribute("focus")) {
            details[index].color = document.querySelector(".inspector .details input#color").value;
            document.querySelector(".object[focus]").style.background = document.querySelector(".inspector .details input#color").value;
            return;
        }
    });
});

document.querySelector(".inspector .details input#gravity").addEventListener("input", () => {
    document.querySelectorAll(".object").forEach((obj, index) => {
        if (obj.getAttribute("focus")) {
            details[index].gravity = document.querySelector(".inspector .details input#gravity").checked;
            return;
        }
    });
});

document.querySelector(".inspector .details input#collision").addEventListener("input", () => {
    document.querySelectorAll(".object").forEach((obj, index) => {
        if (obj.getAttribute("focus")) {
            details[index].collision = document.querySelector(".inspector .details input#collision").checked;
            return;
        }
    });
});

window.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (event.target.className == "object") {
        document.querySelector(".menu.item").style.left = event.clientX + "px";
        document.querySelector(".menu.item").style.top = event.clientY + "px";
        document.querySelector(".menu.item").style.display = "flex";
        document.querySelector(".menu.default").style.display = "none";
        objectMenuTarget = event.target;
    }
    else {
        document.querySelector(".menu.default").style.left = event.clientX + "px";
        document.querySelector(".menu.default").style.top = event.clientY + "px";
        document.querySelector(".menu.default").style.display = "flex";
        document.querySelector(".menu.item").style.display = "none";
    }
});

document.body.addEventListener("click", (event) => {
    if (document.querySelector(".menu.item").style.display == "flex" && !(event.target.classList.contains("object"))) {
        document.querySelector(".menu.item").style.display = "none";
    }
    if (document.querySelector(".menu.default").style.display == "flex" && !(event.target.classList.contains("default"))) {
        document.querySelector(".menu.default").style.display = "none";
    }
});

document.querySelector(".menu.default span#add").addEventListener("click", () => {
    document.querySelector(".create button.spawner.obj").click();
});

document.querySelector(".menu.default span#ref").addEventListener("click", () => {
    document.querySelectorAll(".object").forEach(item => item.remove());
    document.querySelector(".inspector").setAttribute("empty", true);
    document.querySelector(".menu.default").style.display = "none";
});

var objectMenuTarget;
var inspectorTarget;

document.querySelector(".menu.item span#del").addEventListener("click", () => {
    if (objectMenuTarget.getAttribute("focus")) document.querySelector(".inspector").setAttribute("empty", true);
    objectMenuTarget.remove();
    inspectorTarget = null;
});

document.querySelector(".details button#delete").addEventListener("click", () => {
    if (inspectorTarget.getAttribute("focus")) document.querySelector(".inspector").setAttribute("empty", true);
    inspectorTarget.remove();
    inspectorTarget = null;
});

const download = (content, filename, contentType) => {
    if (!contentType) contentType = "application/octet-stream";
    var a = document.createElement("a");
    var blob = new Blob([content], { "type": contentType });
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}