import { spawn } from "node:child_process";

const children = new Set();
let shuttingDown = false;

function stopChildren(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children) child.kill();
  setTimeout(() => process.exit(exitCode), 500).unref();
}

function start(command, args, name) {
  const child = spawn(command, args, { stdio: "inherit", env: process.env, cwd: process.cwd() });
  children.add(child);
  child.on("error", (error) => {
    console.error(`${name} failed to start: ${error.message}`);
    stopChildren(1);
  });
  child.on("exit", (code, signal) => {
    children.delete(child);
    if (!shuttingDown) {
      console.error(`${name} stopped${signal ? ` (${signal})` : ` with exit code ${code}`}.`);
      stopChildren(code || 1);
    }
  });
  return child;
}

async function waitForApi(maxAttempts = 40) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:3001/api/health", { signal: AbortSignal.timeout(500) });
      if (response.ok) {
        const data = await response.json();
        if (data.status === "ok") return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }
  throw new Error("The API did not become ready on port 3001.");
}

process.on("SIGINT", () => stopChildren(0));
process.on("SIGTERM", () => stopChildren(0));

console.log("Starting the CalcMind API…");
start(process.execPath, ["server/index.js"], "CalcMind API");

try {
  await waitForApi();
  console.log("API ready. Starting the web app…");
  start(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1"], "Vite web app");
} catch (error) {
  console.error(`${error.message} Check whether another application is using port 3001.`);
  stopChildren(1);
}
