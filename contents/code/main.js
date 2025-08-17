print("MoveWindowCyclic Script started");

// Configurable settings
const config = {
  tolerance: 40,           // Tolerance for geometry comparison
  minWidth: 100,           // Minimum window width
  minHeight: 50,           // Minimum window height
  enableLogging: true      // Enable/disable logging
};

// Improved logging function
function log(message) {
  if (config.enableLogging) {
    print("[MoveWindowCyclic] " + message);
  }
}

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
  NB8: { action: "TOP", percentages: [50, 33, 20, 67] },
  NB2: { action: "BOTTOM", percentages: [50, 33, 20, 67] },
  NB4: { action: "LEFT", percentages: [50, 33, 20, 67] },
  NB6: { action: "RIGHT", percentages: [50, 33, 20, 67] },
  NB5: { action: "MIDDLE", percentages: [50, 33, 60] },
  NB7: { action: "TOP_LEFT", percentages: [50, 33, 20, 67] },
  NB9: { action: "TOP_RIGHT", percentages: [50, 33, 20, 67] },
  NB1: { action: "BOTTOM_LEFT", percentages: [50, 33, 20, 67] },
  NB3: { action: "BOTTOM_RIGHT", percentages: [50, 33, 20, 67] },
};

// Helper function for preset access
function getPreset(actionKey) {
  return presets[actionKey] || null;
}

function getWorkarea() {
  let window = workspace.activeWindow || workspace.activeClient;
  if (!window) {
    log("No active window for workarea calculation");
    return null;
  }

  try {
    let kwinClientArea = workspace.clientArea(KWin.WorkArea, window);
    if (!kwinClientArea || kwinClientArea.width <= 0 || kwinClientArea.height <= 0) {
      log("Invalid workarea data");
      return null;
    }
    
    log("kwinClientArea : " + kwinClientArea);

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

    log("Workarea determined: " + area.toString());
    return area;
  } catch (error) {
    log("Error getting workarea: " + error.message);
    return null;
  }
}

function calcSettings(percent, action, workarea) {
  // Validation of input parameters
  if (!workarea || percent <= 0 || percent > 100) {
    log("Invalid parameters for calcSettings");
    return null;
  }

  let w = Math.round(workarea.width * (percent / 100));
  let h = 0, x = 0, y = 0;
  const diff = workarea.width - w;

  // Ensure minimum sizes are maintained
  if (w < config.minWidth) w = config.minWidth;
  if (h < config.minHeight) h = config.minHeight;

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
    default:
      log("Unknown action: " + action);
      return null;
  }

  // Ensure minimum sizes are maintained
  if (w < config.minWidth) w = config.minWidth;
  if (h < config.minHeight) h = config.minHeight;

  // Ensure window stays in visible area
  if (x < workarea.x) x = workarea.x;
  if (y < workarea.y) y = workarea.y;
  if (x + w > workarea.x + workarea.width) x = workarea.x + workarea.width - w;
  if (y + h > workarea.y + workarea.height) y = workarea.y + workarea.height - h;

  return { x: x, y: y, width: w, height: h };
}

function makeHandler(actionKey, actionName) {
  let idx = 0;
  return function () {
    let c = workspace.activeClient || workspace.activeWindow;
    if (!c) {
      log("No active window found for action " + actionName);
      return;
    }

    // Check if window is minimizable
    if (c.minimizable && c.minimized) {
      log("Window is minimized, cannot be moved");
      return;
    }

    // Check if window is maximized
    if (c.maximizable && c.maximized) {
      log("Window is maximized, will be restored first");
      c.maximized = false;
    }

    log("Active window: " + c.caption + ", Action: " + actionName);

    let preset = getPreset(actionKey);
    if (!preset) {
      log("No presets for action " + actionName);
      return;
    }

    let workarea = getWorkarea();
    if (!workarea) return;

    let percentList = preset.percentages;
    let found = -1;
    
    for (let i = 0; i < percentList.length; i++) {
      let s = calcSettings(percentList[i], actionName, workarea);
      if (!s) continue;
      
      let dx = Math.abs(c.x - s.x);
      let dy = Math.abs(c.y - s.y);
      let dw = Math.abs(c.width - s.width);
      let dh = Math.abs(c.height - s.height);
      
      if (dx < config.tolerance && dy < config.tolerance && dw < config.tolerance && dh < config.tolerance) {
        found = i;
        break;
      }
    }

    if (found === -1) {
      idx = 0;
      log("No matching geometry found, starting at index 0");
    } else {
      idx = (found + 1) % percentList.length;
      log("Found geometry at index " + found + ", next index: " + idx);
    }

    let target = calcSettings(percentList[idx], actionName, workarea);
    if (!target) {
      log("Error calculating target geometry");
      return;
    }

    log("Setting window geometry to: " + JSON.stringify(target));

    try {
      c.frameGeometry = {
        x: Math.round(target.x),
        y: Math.round(target.y),
        height: target.height,
        width: target.width,
      };
      
      // Activate window for better visibility
      workspace.activeWindow = c;
      
      log("Window geometry successfully set");
      
    } catch (error) {
      log("Error setting window geometry: " + error.message);
    }
  };
}

// Register shortcuts with error handling
function registerShortcutSafely(name, description, key, handler) {
  try {
    registerShortcut(name, description, key, handler);
          log("Shortcut registered: " + name + " (" + key + ")");
  } catch (error) {
          log("Error registering shortcut " + name + ": " + error.message);
  }
}

// Registration of shortcuts
registerShortcutSafely("MoveTop", "Move window top", "Ctrl+Alt+Num+8", makeHandler("NB8", "TOP"));
registerShortcutSafely("MoveBottom", "Move window bottom", "Ctrl+Alt+Num+2", makeHandler("NB2", "BOTTOM"));
registerShortcutSafely("MoveLeft", "Move window left", "Ctrl+Alt+Num+4", makeHandler("NB4", "LEFT"));
registerShortcutSafely("MoveRight", "Move window right", "Ctrl+Alt+Num+6", makeHandler("NB6", "RIGHT"));
registerShortcutSafely("MoveMiddle", "Move window middle", "Ctrl+Alt+Num+5", makeHandler("NB5", "MIDDLE"));
registerShortcutSafely("MoveTopLeft", "Move window top-left", "Ctrl+Alt+Num+7", makeHandler("NB7", "TOP_LEFT"));
registerShortcutSafely("MoveTopRight", "Move window top-right", "Ctrl+Alt+Num+9", makeHandler("NB9", "TOP_RIGHT"));
registerShortcutSafely("MoveBotLeft", "Move window bottom-left", "Ctrl+Alt+Num+1", makeHandler("NB1", "BOTTOM_LEFT"));
registerShortcutSafely("MoveBotRight", "Move window bottom-right", "Ctrl+Alt+Num+3", makeHandler("NB3", "BOTTOM_RIGHT"));

log("MoveWindowCyclic Script loaded");
