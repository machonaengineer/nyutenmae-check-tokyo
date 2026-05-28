import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(__dirname, "..");

async function createTempQueue(content: string) {
  const dir = await mkdtemp(path.join(tmpdir(), "sns-autopost-"));
  const queuePath = path.join(dir, "queue.csv");

  await writeFile(queuePath, content, "utf8");

  return { dir, queuePath };
}

test.describe("SNS自動投稿キュー", () => {
  test("dry-runはapprovedの対象行だけを投稿候補にする", async () => {
    const { dir, queuePath } = await createTempQueue(`date,slot,status,text,target_path,approved_by,posted_at,post_url,notes
2026-05-28,morning,draft,下書きです。,/map,,,,skip
2026-05-28,morning,approved,入店前に料金条件と明細の有無を確認できるよう、チェックリストをまとめています。,/checklists,admin@example.com,,,
`);

    try {
      const { stdout } = await execFileAsync(
        "node",
        [
          "scripts/social-autopost.mjs",
          "--dry-run",
          "--date=2026-05-28",
          "--slot=morning",
          `--queue=${queuePath}`,
        ],
        {
          cwd: rootDir,
          env: {
            ...process.env,
            NEXT_PUBLIC_SITE_URL: "https://example.com",
            SNS_AUTO_POST_ENABLED: "false",
          },
        },
      );

      expect(stdout).toContain("DRY RUN");
      expect(stdout).toContain("https://example.com/checklists");
      expect(stdout).not.toContain("下書きです。");
      expect(stdout).not.toContain("X_USER_ACCESS_TOKEN");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("禁止表現を含む投稿をブロックする", async () => {
    const { dir, queuePath } = await createTempQueue(`date,slot,status,text,target_path,approved_by,posted_at,post_url,notes
2026-05-28,morning,approved,料金確認をしたい詐欺店です。,/checklists,admin@example.com,,,
`);

    try {
      await expect(
        execFileAsync(
          "node",
          [
            "scripts/social-autopost.mjs",
            "--dry-run",
            "--date=2026-05-28",
            "--slot=morning",
            `--queue=${queuePath}`,
          ],
          {
            cwd: rootDir,
            env: {
              ...process.env,
              NEXT_PUBLIC_SITE_URL: "https://example.com",
            },
          },
        ),
      ).rejects.toThrow(/SNS post blocked/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
