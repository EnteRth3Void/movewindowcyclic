# MoveWindowCyclic - KWin Script

A KWin script for KDE Plasma that allows cycling windows between different positions and sizes.

## 🚀 Features

- **9 different window positions**: Top, Bottom, Left, Right, Middle, and all four corners
- **Cyclic movement**: Windows cycle through different sizes with each execution (50%, 33%, 20%, 67%)
- **Smart size adjustment**: Uses percentages of the work area
- **Minimum sizes**: Prevents windows from becoming too small (min. 100x50 pixels)
- **Tolerance system**: Recognizes similar window positions for seamless transitions

## ⌨️ Keyboard Shortcuts

| Action | Shortcut | Description |
|--------|----------|-------------|
| **Top** | `Ctrl+Alt+Num+8` | Move window to top |
| **Bottom** | `Ctrl+Alt+Num+2` | Move window to bottom |
| **Left** | `Ctrl+Alt+Num+4` | Move window to left |
| **Right** | `Ctrl+Alt+Num+6` | Move window to right |
| **Middle** | `Ctrl+Alt+Num+5` | Move window to center |
| **Top-Left** | `Ctrl+Alt+Num+7` | Move window to top-left corner |
| **Top-Right** | `Ctrl+Alt+Num+9` | Move window to top-right corner |
| **Bottom-Left** | `Ctrl+Alt+Num+1` | Move window to bottom-left corner |
| **Bottom-Right** | `Ctrl+Alt+Num+3` | Move window to bottom-right corner |

## 📦 Installation

### Via KDE Store (Recommended)
1. Open KDE System Settings → Window Management → KWin Scripts
2. Click "Get New KWin Scripts..."
3. Search for "MoveWindowCyclic"
4. Install and enable the script

### Manual Installation

#### Option 1: Using kpackagetool6 (Recommended)
1. Download and extract the script
2. Install using: `kpackagetool6 --type=KWin/Script -i /path/to/movewindowcyclic/`
3. Enable in KDE System Settings → Window Management → KWin Scripts

#### Option 2: Via GUI
1. Download the `.kwinscript` file
2. Open KDE System Settings → Window Management → KWin Scripts
3. Click "Import KWin Script..." and select the downloaded file
4. Enable the "Move Window Cyclic" script

## 🔧 Usage

1. **Select window**: The active window is automatically used
2. **Press shortcut**: Use one of the keyboard shortcuts
3. **Cyclic movement**: Press the same key again for different sizes:
   - 1st press: 50% of screen width/height
   - 2nd press: 33% of screen width/height  
   - 3rd press: 20% of screen width/height
   - 4th press: 67% of screen width/height
   - 5th press: Back to 50% (cycle repeats)

## ⚙️ Configuration

The script can be customized by editing `main.js`:

```javascript
const config = {
  tolerance: 40,           // Tolerance for geometry comparison (pixels)
  minWidth: 100,           // Minimum window width (pixels)
  minHeight: 50,           // Minimum window height (pixels)
  enableLogging: true      // Enable/disable debug output
};
```

## 📱 Supported Windows

- ✅ All normal application windows
- ✅ Maximized windows (automatically restored)
- ❌ Minimized windows (cannot be moved)
- ✅ Works with all KDE applications

## 🐛 Troubleshooting

**Script not working:**
- Check if the script is enabled in KDE Settings
- Look at the console (`journalctl -f`) for error messages

**Shortcuts not working:**
- Check if the shortcuts are already used by other applications
- Modify the shortcuts in `main.js` if needed

## 🤝 Contributing

Improvements and bug reports are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Create a pull request

## 📄 License

GPL-3.0 License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

**EnteRth3Void** - [aeisenbr.dev@gmail.com](mailto:aeisenbr.dev@gmail.com)

## 📝 Changelog

### Version 1.0
- Initial release
- 9 different window positions
- Cyclic size changes with 4 different sizes
- Configurable tolerances and minimum sizes
- Comprehensive logging system
- Automatic restoration of maximized windows