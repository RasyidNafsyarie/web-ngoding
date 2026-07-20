/**
 * Memproteksi kode JavaScript dari infinite loop dengan menyisipkan
 * fungsi pengecekan watchdog di setiap iterasi loop (while, for, do-while).
 *
 * Pendekatan ini menyisipkan kondisi tambahan pada loop bersangkutan
 * agar tidak membekukan tab browser jika terjadi kesalahan logika.
 */
export function protectLoops(code: string): string {
  let loopId = 0;

  // 1. Proteksi untuk loop 'for' (format: for(init; cond; step))
  // Mencari struktur for dengan 2 buah semicolon di dalamnya.
  let instrumented = code.replace(
    /for\s*\(\s*([^;]*)\s*;\s*([^;]*)\s*;\s*([^)]*)\)/g,
    (match, init, cond, incr) => {
      loopId++;
      const safeCond = cond.trim()
        ? `(${cond}) && (window._checkLoop ? window._checkLoop(${loopId}) : true)`
        : `(window._checkLoop ? window._checkLoop(${loopId}) : true)`;
      return `for (${init}; ${safeCond}; ${incr})`;
    },
  );

  // 2. Proteksi untuk loop 'while' (format: while(cond))
  instrumented = instrumented.replace(/while\s*\(([^)]+)\)/g, (match, cond) => {
    if (!cond.trim()) return match;
    loopId++;
    return `while ((${cond}) && (window._checkLoop ? window._checkLoop(${loopId}) : true))`;
  });

  return instrumented;
}

/**
 * Menyusun kode HTML, CSS, dan JS menjadi satu dokumen HTML (srcdoc)
 * yang akan dieksekusi di dalam iframe ter-sandbox.
 * Di dalamnya disisipkan script untuk memantau log konsol dan watchdog infinite loop.
 */
export function compileSrcDoc(html: string, css: string, js: string): string {
  // Proteksi JS dari loop tak terbatas
  const safeJs = protectLoops(js);

  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>Ngoding Santuy Playground Preview</title>
  <style>
    body {
      margin: 0;
      padding: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      color: #1a1a2e;
      background-color: #fafaf5;
    }
    /* CSS Pengguna */
    ${css}
  </style>
  <script>
    // 1. Mekanisme watchdog untuk mendeteksi loop tak terbatas
    (function() {
      const loopLimits = {};
      window._checkLoop = function(loopId) {
        const now = Date.now();
        if (!loopLimits[loopId]) {
          loopLimits[loopId] = { start: now, count: 0 };
          return true;
        }
        loopLimits[loopId].count++;
        // Periksa setiap 100 iterasi agar tidak membebani performa
        if (loopLimits[loopId].count % 100 === 0) {
          if (now - loopLimits[loopId].start > 1000) {
            console.error("Infinite loop terdeteksi! Skrip dihentikan demi menjaga kestabilan browser.");
            return false;
          }
        }
        return true;
      };
    })();
  </script>
  <script>
    // 2. Interseptor console.log untuk dikirim ke parent window via postMessage
    (function() {
      const postMessageToParent = (type, args) => {
        window.parent.postMessage({
          source: 'ngoding-santuy-playground',
          type: 'KONSOL_LOG',
          payload: {
            type,
            args: args.map(arg => {
              if (arg === null) return 'null';
              if (arg === undefined) return 'undefined';
              if (typeof arg === 'object') {
                try {
                  return JSON.stringify(arg);
                } catch(e) {
                  return '[Objek tidak dapat diserialisasi]';
                }
              }
              return String(arg);
            })
          }
        }, '*');
      };

      // Simpan fungsi asli agar tetap bisa mencetak di konsol browser asli jika diperlukan
      const originalLog = console.log;
      const originalWarn = console.warn;
      const originalError = console.error;
      const originalInfo = console.info;

      console.log = function(...args) {
        originalLog.apply(console, args);
        postMessageToParent('log', args);
      };
      console.warn = function(...args) {
        originalWarn.apply(console, args);
        postMessageToParent('warn', args);
      };
      console.error = function(...args) {
        originalError.apply(console, args);
        postMessageToParent('error', args);
      };
      console.info = function(...args) {
        originalInfo.apply(console, args);
        postMessageToParent('info', args);
      };

      // Tangkap runtime error global di window secara ramah-pemula
      window.addEventListener('error', function(event) {
        let cleanMessage = event.message;
        if (event.error && event.error.message) {
          cleanMessage = event.error.message;
        }
        postMessageToParent('error', [cleanMessage]);
        return false;
      });
    })();
  </script>
</head>
<body>
  ${html}
  
  <script>
    // 3. Eksekusi JavaScript Pengguna
    try {
      ${safeJs}
    } catch(err) {
      console.error(err.message || String(err));
    }
  </script>
</body>
</html>
`;
}
