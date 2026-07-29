import {
  validateExecutionInput,
} from "./execution.validator.js";

import {
  runInSandbox,
} from "./sandbox.service.js";

const executeCode = async ({
  code,
  language,
  input = "",
}) => {
  // Step 1: Validate input
  const validation =
    validateExecutionInput({
      code,
      language,
      input,
    });

  // Step 2: Stop if invalid
  if (!validation.isValid) {
    return {
      status: "ERROR",

      output: "",

      error:
        validation.error,

      executionTime: 0,
    };
  }

  // Step 3: Run code
  const result =
    await runInSandbox({
      code,
      language,
      input,
    });

  // Step 4: Return result
  return result;
};

export {
  executeCode,
};