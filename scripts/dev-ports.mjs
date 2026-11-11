import { createServer } from "node:net";

const frontendCount = 7;

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.listen(port, "127.0.0.1", () => {
      server.close(() => resolve(true));
    });
  });
}

async function isPortBlockAvailable(basePort) {
  const results = await Promise.all(
    Array.from({ length: frontendCount }, (_, offset) =>
      isPortAvailable(basePort + offset),
    ),
  );
  return results.every(Boolean);
}

export async function getFrontendPortBase() {
  const configuredBase = process.env.HEALTHCARE_PORT_BASE;
  if (configuredBase !== undefined) {
    const basePort = Number(configuredBase);
    if (
      !Number.isInteger(basePort) ||
      basePort < 1 ||
      basePort + frontendCount - 1 > 65535
    ) {
      throw new Error("HEALTHCARE_PORT_BASE must be a valid port for seven apps.");
    }
    if (!(await isPortBlockAvailable(basePort))) {
      throw new Error(
        `Ports ${basePort}-${basePort + frontendCount - 1} are not all available.`,
      );
    }
    return basePort;
  }

  for (let basePort = 3000; basePort + frontendCount <= 65535; basePort += 1) {
    if (await isPortBlockAvailable(basePort)) return basePort;
  }
  throw new Error("No available block of seven frontend ports was found.");
}
