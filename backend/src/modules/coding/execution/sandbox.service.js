import Docker from "dockerode";
import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";

const docker =
  new Docker();

const LANGUAGE_CONFIG = {
  javascript: {
    image: "node:22-alpine",
    fileName: "main.js",
    command: ["node", "main.js"],
  },

  python: {
    image: "python:3.13-alpine",
    fileName: "main.py",
    command: ["python", "main.py"],
  },
};

const EXECUTION_TIMEOUT =
  5000;

const runInSandbox = async ({
  code,
  language,
  input = "",
}) => {
  const config =
    LANGUAGE_CONFIG[language];

  if (!config) {
    return {
      status: "ERROR",
      output: "",
      error:
        "Unsupported programming language",
      executionTime: 0,
    };
  }

  const executionId =
    crypto.randomUUID();

  const tempDir =
    path.join(
      os.tmpdir(),
      `code-${executionId}`
    );

  const containerName =
    `code-execution-${executionId}`;

  let container = null;

  const startTime =
    Date.now();

  try {
    // 1. Create temporary directory
    await fs.mkdir(
      tempDir,
      {
        recursive: true,
      }
    );

    // 2. Create source file
    const sourceFile =
      path.join(
        tempDir,
        config.fileName
      );

    await fs.writeFile(
      sourceFile,
      code,
      "utf-8"
    );

    // 3. Create input file
    const inputFile =
      path.join(
        tempDir,
        "input.txt"
      );

    await fs.writeFile(
      inputFile,
      input,
      "utf-8"
    );

    // 4. Create container
    container =
      await docker.createContainer({
        name: containerName,

        Image:
          config.image,

        Cmd:
          config.command,

        WorkingDir:
          "/workspace",

        HostConfig: {
          Binds: [
            `${tempDir}:/workspace:ro`,
          ],

          Memory:
            128 * 1024 * 1024,

          NanoCpus:
            500000000,

          NetworkMode:
            "none",

          AutoRemove:
            false,
        },

        AttachStdout:
          true,

        AttachStderr:
          true,
      });

    // 5. Start container
    await container.start();

    // 6. Wait for execution
    const result =
      await waitForExecution(
        container
      );

    return {
      ...result,

      executionTime:
        Date.now() -
        startTime,
    };
  } catch (error) {
    console.error(
      "Sandbox execution error:",
      error
    );

    return {
      status: "ERROR",

      output: "",

      error:
        error.message,

      executionTime:
        Date.now() -
        startTime,
    };
  } finally {
    // 7. Cleanup container
    if (container) {
      try {
        await container.remove({
          force: true,
        });
      } catch (error) {
        console.error(
          "Container cleanup failed:",
          error.message
        );
      }
    }

    // 8. Cleanup temporary files
    try {
      await fs.rm(
        tempDir,
        {
          recursive: true,
          force: true,
        }
      );
    } catch (error) {
      console.error(
        "Temporary directory cleanup failed:",
        error.message
      );
    }
  }
};

const waitForExecution =
  async (container) => {
    return new Promise(
      async (resolve) => {
        let finished = false;

        // Timeout timer
        const timeout =
          setTimeout(
            async () => {
              if (finished) {
                return;
              }

              finished = true;

              try {
                await container.kill();
              } catch (error) {
                console.error(
                  "Container kill failed:",
                  error.message
                );
              }

              resolve({
                status:
                  "TIMEOUT",

                output: "",

                error:
                  "Code execution timed out",

                executionTime:
                  EXECUTION_TIMEOUT,
              });
            },
            EXECUTION_TIMEOUT
          );

        try {
          // Wait for container to finish
          const result =
            await container.wait();

          if (finished) {
            return;
          }

          finished = true;

          clearTimeout(
            timeout
          );

          // Get logs
          const logs =
            await container.logs({
              stdout: true,
              stderr: true,
            });

          const output =
            logs.toString();

          const exitCode =
            result.StatusCode;

          resolve({
            status:
              exitCode === 0
                ? "SUCCESS"
                : "ERROR",

            output,

            error:
              exitCode === 0
                ? null
                : output,

            executionTime: 0,
          });
        } catch (error) {
          if (finished) {
            return;
          }

          finished = true;

          clearTimeout(
            timeout
          );

          resolve({
            status: "ERROR",

            output: "",

            error:
              error.message,

            executionTime: 0,
          });
        }
      }
    );
  };

export {
  runInSandbox,
};