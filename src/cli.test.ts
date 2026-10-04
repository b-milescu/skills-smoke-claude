import { expect, test } from "bun:test";

test("cli prints add(2, 3) and exits 0", () => {
  const result = Bun.spawnSync([process.execPath, `${import.meta.dir}/cli.ts`]);
  expect(result.stdout.toString()).toBe("5\n");
  expect(result.exitCode).toBe(0);
});
