print("MoveWindowCyclic Script gestartet");

class Rect {
  constructor(x, y, width, height, left, right, top, bottom) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  toString() {
    return JSON.stringify(this, null, 2);
  }

  get centerX() {
    return this.x + this.width / 2;
  }

  get centerY() {
    return this.y + this.height / 2;
  }
}

const presets = {
  NB8: [50, 33, 20, 67],
  NB2: [50, 33, 20, 67],
  NB4: [50, 33, 20, 67],
  NB6: [50, 33, 20, 67],
  NB5: [50, 33, 60],
  NB7: [50, 33, 20, 67], // TOP_LEFT
  NB9: [50, 33, 20, 67], // TOP_RIGHT
  NB1: [50, 33, 20, 67], // BOTTOM_LEFT
  NB3: [50, 33, 20, 67], // BOTTOM_RIGHT
};

function getWorkarea() {
  let window = workspace.activeWindow || workspace.activeClient;
  if (!window) {
    print("Kein aktives Fenster für Workarea-Berechnung");
    return null;
  }

  let kwinClientArea = workspace.clientArea(KWin.WorkArea, window);
  print("kwinClientArea : " + kwinClientArea);

  let area = new Rect(
    kwinClientArea.x,
    kwinClientArea.y,
    kwinClientArea.width,
    kwinClientArea.height,
    kwinClientArea.left,
    kwinClientArea.right,
    kwinClientArea.top,
    kwinClientArea.bottom,
  );

  print("Workarea ermittelt: " + area.toString());
  return area;
}

function calcSettings(percent, action, workarea) {
  let w = Math.round(workarea.width * (percent / 100));
  let h = 0,
    x = 0,
    y = 0;
  const diff = workarea.width - w;

  switch (action) {
    case "TOP":
      h = Math.floor(workarea.height / 2);
      y = workarea.y;
      x = diff === 0 ? workarea.x : workarea.x + Math.floor(diff / 2);
      break;
    case "BOTTOM":
      h = Math.floor(workarea.height / 2);
      y = workarea.y + Math.floor(workarea.height / 2);
      x = diff === 0 ? workarea.x : workarea.x + Math.floor(diff / 2);
      break;
    case "LEFT":
      x = workarea.x;
      y = workarea.y;
      h = workarea.height;
      w = Math.round(workarea.width * (percent / 100));
      break;
    case "RIGHT":
      w = Math.round(workarea.width * (percent / 100));
      x = workarea.x + (workarea.width - w);
      y = workarea.y;
      h = workarea.height;
      break;
    case "MIDDLE":
      h = workarea.height;
      y = workarea.y;
      x = diff === 0 ? workarea.x : workarea.x + Math.floor(diff / 2);
      break;
    case "TOP_LEFT":
      x = workarea.x;
      y = workarea.y;
      h = Math.floor(workarea.height / 2);
      break;
    case "TOP_RIGHT":
      w = Math.round(workarea.width * (percent / 100));
      x = workarea.x + (workarea.width - w);
      y = workarea.y;
      h = Math.floor(workarea.height / 2);
      break;
    case "BOTTOM_LEFT":
      x = workarea.x;
      y = workarea.y + Math.floor(workarea.height / 2);
      h = Math.floor(workarea.height / 2);
      break;
    case "BOTTOM_RIGHT":
      w = Math.round(workarea.width * (percent / 100));
      x = workarea.x + (workarea.width - w);
      y = workarea.y + Math.floor(workarea.height / 2);
      h = Math.floor(workarea.height / 2);
      break;
  }

  return { x: x, y: y, width: w, height: h };
}

function makeHandler(actionKey, actionName) {
  let idx = 0;
  return function () {
    let c = workspace.activeClient || workspace.activeWindow;
    if (!c) {
      print("Kein aktives Fenster gefunden für Aktion " + actionName);
      return;
    }
    print("Aktives Fenster: " + c.caption + ", Aktion: " + actionName);

    let percentList = presets[actionKey];
    if (!percentList || percentList.length === 0) {
      print("Keine Presets für Aktion " + actionName);
      return;
    }

    let workarea = getWorkarea();
    if (!workarea) return;

    let found = -1;
    for (let i = 0; i < percentList.length; i++) {
      let s = calcSettings(percentList[i], actionName, workarea);
      let dx = Math.abs(c.x - s.x),
        dy = Math.abs(c.y - s.y);
      let dw = Math.abs(c.width - s.width),
        dh = Math.abs(c.height - s.height);
      if (dx < 40 && dy < 40 && dw < 40 && dh < 40) {
        found = i;
        break;
      }
    }

    if (found === -1) {
      idx = 0;
      print("Keine passende Geometrie gefunden, starte bei Index 0");
    } else {
      idx = (found + 1) % percentList.length;
      print(
        "Gefundene Geometrie an Index " + found + ", nächster Index: " + idx,
      );
    }

    let target = calcSettings(percentList[idx], actionName, workarea);
    print("Setze Fenster-Geometrie auf: " + JSON.stringify(target));

    c.frameGeometry = {
      x: Math.round(target.x),
      y: Math.round(target.y),
      height: target.height,
      width: target.width,
    };

    print("c :", c.toString());
    print("geometry :", c.clientGeomerty);
    print("x :", c.x);
    print("y :", c.y);
    print("width :", c.width);
    print("height :", c.height);
  };
}

registerShortcut(
  "MoveTop",
  "Move window top",
  "Ctrl+Alt+Num+8",
  makeHandler("NB8", "TOP"),
);
registerShortcut(
  "MoveBottom",
  "Move window bottom",
  "Ctrl+Alt+Num+2",
  makeHandler("NB2", "BOTTOM"),
);
registerShortcut(
  "MoveLeft",
  "Move window left",
  "Ctrl+Alt+Num+4",
  makeHandler("NB4", "LEFT"),
);
registerShortcut(
  "MoveRight",
  "Move window right",
  "Ctrl+Alt+Num+6",
  makeHandler("NB6", "RIGHT"),
);
registerShortcut(
  "MoveMiddle",
  "Move window middle",
  "Ctrl+Alt+Num+5",
  makeHandler("NB5", "MIDDLE"),
);
registerShortcut(
  "MoveTopLeft",
  "Move window top-left",
  "Ctrl+Alt+Num+7",
  makeHandler("NB7", "TOP_LEFT"),
);
registerShortcut(
  "MoveTopRight",
  "Move window top-right",
  "Ctrl+Alt+Num+9",
  makeHandler("NB9", "TOP_RIGHT"),
);
registerShortcut(
  "MoveBotLeft",
  "Move window bottom-left",
  "Ctrl+Alt+Num+1",
  makeHandler("NB1", "BOTTOM_LEFT"),
);
registerShortcut(
  "MoveBotRight",
  "Move window bottom-right",
  "Ctrl+Alt+Num+3",
  makeHandler("NB3", "BOTTOM_RIGHT"),
);

print("MoveWindowCyclic Script geladen");
