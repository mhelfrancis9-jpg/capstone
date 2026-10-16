/**
 * Kill any stale node process holding the configured port before `next start`.
 * Prevents the "blink then This page couldn't load" failure caused by a
 * previous run still occupying the port.
 */

const PORT = process.env.PORT || 3000;

const { execSync } = require("child_process");

function killStale() {
  try {
    // Find the PID listening on the port (Windows).
    const out = execSync(
      `netstat -ano | findstr /R "LISTENING" | findstr ":${PORT}"`,
      { stdio: ["pipe", "pipe", "pipe"] }
    ).toString();

    const pids = new Set(
      out
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const parts = line.split(/\s+/);
          return parts[parts.length - 1];
        })
        .filter((pid) => /^\d+$/.test(pid))
    );

    if (pids.size === 0) {
      console.log(`[prestart] No stale process on port ${PORT}.`);
      return;
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /pid ${pid} /f`, { stdio: "ignore" });
        console.log(`[prestart] Killed stale process ${pid} on port ${PORT}.`);
      } catch {
        // Process may already be gone.
      }
    }
  } catch (err) {
    // netstat/findstr may not find anything — that's fine.
    if (err.stdout && err.stdout.includes(":3000")) {
      // handled above; nothing to do.
    }
    console.log(`[prestart] No stale process on port ${PORT}.`);
  }
}

killStale();