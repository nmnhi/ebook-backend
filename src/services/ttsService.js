import { spawn } from "child_process";
import fs from "fs";
import path from "path";

export const synthesizeSpeech = async (text) => {
  const modelPath = path.resolve("src/models/en_US-amy-medium.onnx");
  const configPath = path.resolve("src/models/en_US-amy-medium.onnx.json");
  const outputPath = path.resolve("src/models/output.wav");
  const piperPath = path.resolve("piper/piper");

  return new Promise((resolve, reject) => {
    const args = [
      "--model",
      modelPath,
      "--config",
      configPath,
      "--output_file",
      outputPath
    ];

    const child = spawn(piperPath, args, {
      env: {
        ...process.env,
        LD_LIBRARY_PATH: path.resolve("piper")
      }
    });

    child.stdin.write(text);
    child.stdin.end();

    child.on("error", (err) => {
      console.error("❌ Piper spawn error:", err);
      reject(err);
    });

    child.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Piper exited with code ${code}`));
      }

      fs.readFile(outputPath, (err, data) => {
        if (err) {
          console.error("❌ Read output.wav error:", err);
          return reject(err);
        }

        resolve(data);
      });
    });
  });
};
