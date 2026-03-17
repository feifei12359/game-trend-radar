import { spawn } from "node:child_process";

async function main() {
  console.log("start radar-daily");

  try {
    console.log("step 1/3: fetch-youtube");
    await runStep("fetch-youtube", "npm", ["run", "fetch:youtube"]);
    console.log("fetch-youtube done");

    console.log("step 2/3: check-keywords");
    await runStep("check-keywords", "npm", ["run", "check:keywords"]);
    console.log("check-keywords done");

    console.log("step 3/3: score-games");
    await runStep("score-games", "npm", ["run", "score:games"]);
    console.log("score-games done");

    console.log("done radar-daily");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

function runStep(stepName: string, command: string, args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", (error) => {
      reject(new Error(`radar-daily failed at step: ${stepName} (${error.message})`));
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`radar-daily failed at step: ${stepName} (exit code: ${code ?? "unknown"})`));
    });
  });
}

void main();
