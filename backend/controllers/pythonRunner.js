const { exec } = require('child_process');
const path     = require('path');
const { PYTHON_CMD, PYTHON_ENGINE_PATH, API_TIMEOUT_MS } = require('../config/constants');

/**
 * Run the Python engine and return parsed JSON.
 * @param {string} mode  - 'api' (cached) or 'full' (retrain)
 * @returns {Promise<object>}
 */
function runPython(mode = 'api') {
  return new Promise((resolve, reject) => {
    const script  = path.resolve(__dirname, '../../python_engine/main.py');
    const cmd     = `${PYTHON_CMD} "${script}" --mode ${mode}`;
    const options = { timeout: API_TIMEOUT_MS * 4, maxBuffer: 10 * 1024 * 1024 };

    exec(cmd, options, (err, stdout, stderr) => {
      if (stderr) console.error('[Python stderr]', stderr.slice(0, 500));
      if (err)    return reject(new Error(`Python engine error: ${err.message}`));
      try {
        const data = JSON.parse(stdout);
        if (data.status === 'error') return reject(new Error(data.message));
        resolve(data);
      } catch (parseErr) {
        reject(new Error(`Failed to parse Python output: ${parseErr.message}`));
      }
    });
  });
}

module.exports = { runPython };
