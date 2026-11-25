const nextPackagePath = require.resolve('next/package.json');
const envPackagePath = require.resolve('@next/env', { paths: [nextPackagePath] });
const { loadEnvConfig } = require(envPackagePath);

loadEnvConfig(process.cwd(), true);

const apiBase =
  process.env.NEXT_PUBLIC_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  'http://localhost:8080';
const healthUrl = new URL('/actuator/health', apiBase);
const timeoutAt = Date.now() + 60_000;
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForApi() {
  let hasLoggedWait = false;

  while (Date.now() < timeoutAt) {
    try {
      const response = await fetch(healthUrl, { signal: AbortSignal.timeout(1_500) });

      if (response.ok) {
        if (hasLoggedWait) console.log('DAPYO API is ready.');
        return;
      }
    } catch {
      // The backend can take a few seconds to finish initializing during local startup.
    }

    if (!hasLoggedWait) {
      console.log('Waiting for the DAPYO API to become ready before starting Next.js...');
      hasLoggedWait = true;
    }

    await delay(1_000);
  }

  console.error(
    `DAPYO API did not become ready within 60 seconds. Check that the backend is running and reachable at ${healthUrl.origin}.`,
  );
  process.exitCode = 1;
}

waitForApi();
