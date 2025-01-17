import path from "path";
import { bunExe, bunEnv } from "harness";
const cwd = import.meta.dir;

export async function generateClient(type: string) {
  generate(type);

  // This should run the first time on a fresh db
  try {
    migrate(type);
  } catch (err: any) {
    if (err.message.indexOf("Environment variable not found:") !== -1) throw err;
  }

  return (await import(`./prisma/${type}/client`)).PrismaClient;
}
export function migrate(type: string) {
  const result = Bun.spawnSync(
    [
      bunExe(),
      "x",
      "prisma",
      "migrate",
      "dev",
      "--name",
      "init",
      "--schema",
      path.join(cwd, "prisma", type, "schema.prisma"),
    ],
    {
      cwd,
      env: {
        ...bunEnv,
        NODE_ENV: undefined,
      },
    },
  );
  if (!result.success) throw new Error(result.stderr.toString("utf8"));
}

export function generate(type: string) {
  const result = Bun.spawnSync(
    [bunExe(), "prisma", "generate", "--schema", path.join(cwd, "prisma", type, "schema.prisma")],
    {
      cwd,
      env: {
        ...bunEnv,
        NODE_ENV: undefined,
      },
    },
  );
  if (!result.success) throw new Error(result.stderr.toString("utf8"));
}
