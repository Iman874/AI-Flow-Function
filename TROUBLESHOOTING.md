# 🔧 Troubleshooting Guide

## Issue: Purple Connections Tidak Muncul

### Kemungkinan Penyebab:
1. **Browser Cache** - Browser masih pakai versi lama
2. **Hot Reload Gagal** - Vite HMR tidak update dengan benar

### Solusi:

#### 1. Hard Refresh Browser
**Windows/Linux:** `Ctrl + Shift + R` atau `Ctrl + F5`
**Mac:** `Cmd + Shift + R`

#### 2. Clear Browser Cache
1. Buka DevTools (F12)
2. Klik kanan pada refresh button
3. Pilih "Empty Cache and Hard Reload"

#### 3. Restart Dev Server
```bash
# Stop server (Ctrl+C)
# Start ulang
npm run dev
```

#### 4. Test dengan Console
Buka DevTools Console (F12) dan paste:
```javascript
// Test apakah pseudoToFlow sudah update
import { pseudoToFlow } from './src/utils/pseudoToFlow.js';
const result = pseudoToFlow('FUNCTION test DECLARE x as int PROCESS x = x * 2');
console.log('Nodes:', result.nodes);
console.log('Edges:', result.edges);
// Cek apakah ada edge dengan style.stroke === '#8b5cf6' (purple)
```

---

## Quick Test Steps

1. **Hard refresh** browser (Ctrl+Shift+R)
2. **Clear** input box
3. **Paste** test case:
   ```
   FUNCTION test DECLARE x as int READ x PROCESS x = x * 2 PRINT x
   ```
4. **Klik** arrow button (→)
5. **Cek** apakah ada purple lines

### Yang Harus Terlihat:
- ✅ Variable "x" dengan type "int"
- ✅ **Purple line** dari Variable x → Process node
- ✅ **Purple line** dari Variable x → Output node
- ✅ Process label: "x = x * 2" (bukan "x = x * 2 - x")

---

## Jika Masih Belum Muncul

Kemungkinan ada issue dengan edge rendering. Coba:

1. **Inspect Element** pada Process node
2. Cek di React DevTools apakah `connectedVariables` ada di node data
3. Cek di Network tab apakah `pseudoToFlow.js` sudah ter-load versi terbaru

---

## Alternative: Manual Test

Jika auto-connect tidak work, bisa test manual:
1. Drag Variable node ke canvas
2. Drag Process node ke canvas  
3. Manual connect dari Variable → Process (handle varInput)
4. Cek apakah connection muncul purple

Jika manual connection work tapi auto-connect tidak, berarti issue di parser.
