import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(__dirname, "..");

async function createTempQueue(content: string) {
  const dir = await mkdtemp(path.join(tmpdir(), "sns-reply-"));
  const queuePath = path.join(dir, "queue.csv");

  await writeFile(queuePath, content, "utf8");

  return { dir, queuePath };
}

test.describe("SNS返信キュー", () => {
  test("dry-runはsummonedかつapprovedの返信だけを候補にする", async () => {
    const { dir, queuePath } = await createTempQueue(`discovered_at,source_url,tweet_id,author_handle,summoned_account,status,reply_text,target_path,approved_by,posted_at,reply_url,notes
2026-05-28T00:00:00+09:00,https://x.com/example/status/1,1,example,no,approved,これは呼ばれていない返信です。,/reports/quick,admin@example.com,,,
2026-05-28T00:00:00+09:00,https://x.com/example/status/2,2,example,yes,approved,大変でしたね。料金説明・会計内容・明細の経緯があれば、非公開フォームから情報提供できます。,/reports/quick,admin@example.com,,,
`);

    try {
      const { stdout } = await execFileAsync(
        "node",
        [
          "scripts/social-reply.mjs",
          "--dry-run",
          "--tweet-id=2",
          `--queue=${queuePath}`,
        ],
        {
          cwd: rootDir,
          env: {
            ...process.env,
            NEXT_PUBLIC_SITE_URL: "https://example.com",
            SNS_AUTO_REPLY_ENABLED: "false",
          },
        },
      );

      expect(stdout).toContain("DRY RUN");
      expect(stdout).toContain("reply_to=2");
      expect(stdout).toContain("https://example.com/reports/quick");
      expect(stdout).not.toContain("これは呼ばれていない返信です。");
      expect(stdout).not.toContain("X_USER_ACCESS_TOKEN");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("summonedでない返信をブロックする", async () => {
    const { dir, queuePath } = await createTempQueue(`discovered_at,source_url,tweet_id,author_handle,summoned_account,status,reply_text,target_path,approved_by,posted_at,reply_url,notes
2026-05-28T00:00:00+09:00,https://x.com/example/status/1,1,example,no,approved,料金説明・会計内容・明細の経緯があれば、非公開フォームから情報提供できます。,/reports/quick,admin@example.com,,,
`);

    try {
      await expect(
        execFileAsync(
          "node",
          [
            "scripts/social-reply.mjs",
            "--dry-run",
            "--tweet-id=1",
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
      ).rejects.toThrow(/SNS reply blocked/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("禁止表現を含む返信をブロックする", async () => {
    const { dir, queuePath } = await createTempQueue(`discovered_at,source_url,tweet_id,author_handle,summoned_account,status,reply_text,target_path,approved_by,posted_at,reply_url,notes
2026-05-28T00:00:00+09:00,https://x.com/example/status/3,3,example,yes,approved,詐欺店の情報をください。,/reports/quick,admin@example.com,,,
`);

    try {
      await expect(
        execFileAsync(
          "node",
          [
            "scripts/social-reply.mjs",
            "--dry-run",
            "--tweet-id=3",
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
      ).rejects.toThrow(/SNS reply blocked/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
