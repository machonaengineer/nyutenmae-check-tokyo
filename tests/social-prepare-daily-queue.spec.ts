import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { expect, test } from "@playwright/test";

const execFileAsync = promisify(execFile);
const rootDir = path.resolve(__dirname, "..");

async function createTempFiles(queueContent: string, calendarContent: string) {
  const dir = await mkdtemp(path.join(tmpdir(), "sns-prepare-"));
  const queuePath = path.join(dir, "queue.csv");
  const calendarPath = path.join(dir, "calendar.csv");

  await writeFile(queuePath, queueContent, "utf8");
  await writeFile(calendarPath, calendarContent, "utf8");

  return { calendarPath, dir, queuePath };
}

const queueHeader = "date,slot,status,text,target_path,approved_by,posted_at,post_url,notes";
const calendarHeader =
  "day,slot,platform,post_type,theme,post_text,target_url,cta,safety_check,status";

test.describe("SNS日次投稿キュー生成", () => {
  test("今日分のapproved投稿をカレンダーから生成する", async () => {
    const { calendarPath, dir, queuePath } = await createTempFiles(
      `${queueHeader}
`,
      `${calendarHeader}
1,morning,X,checklist,確認,入店前に確認したい項目をまとめています。,/checklists,保存,安全確認済み,ready
`,
    );

    try {
      const { stdout } = await execFileAsync(
        "node",
        [
          "scripts/social-prepare-daily-queue.mjs",
          "--date=2026-05-30",
          "--slot=morning",
          `--queue=${queuePath}`,
          `--calendar=${calendarPath}`,
        ],
        { cwd: rootDir },
      );
      const queue = await readFile(queuePath, "utf8");

      expect(stdout).toContain("SNS queue item prepared");
      expect(queue).toContain("2026-05-30,morning,approved");
      expect(queue).toContain("daily-safe-calendar");
      expect(queue).toContain("/checklists");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("同じ日付とslotがある場合は二重生成しない", async () => {
    const { calendarPath, dir, queuePath } = await createTempFiles(
      `${queueHeader}
2026-05-30,morning,posted,既存投稿です。,/checklists,Codex,2026-05-30T00:00:00+09:00,https://x.com/example/status/1,posted
`,
      `${calendarHeader}
1,morning,X,checklist,確認,新しい投稿です。,/map,保存,安全確認済み,ready
`,
    );

    try {
      const { stdout } = await execFileAsync(
        "node",
        [
          "scripts/social-prepare-daily-queue.mjs",
          "--date=2026-05-30",
          "--slot=morning",
          `--queue=${queuePath}`,
          `--calendar=${calendarPath}`,
        ],
        { cwd: rootDir },
      );
      const queue = await readFile(queuePath, "utf8");

      expect(stdout).toContain("already has an item");
      expect(queue).not.toContain("新しい投稿です。");
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test("禁止表現を含むカレンダー行は生成しない", async () => {
    const { calendarPath, dir, queuePath } = await createTempFiles(
      `${queueHeader}
`,
      `${calendarHeader}
1,morning,X,checklist,確認,料金確認をしたい詐欺店です。,/checklists,保存,安全確認済み,ready
`,
    );

    try {
      await expect(
        execFileAsync(
          "node",
          [
            "scripts/social-prepare-daily-queue.mjs",
            "--date=2026-05-30",
            "--slot=morning",
            `--queue=${queuePath}`,
            `--calendar=${calendarPath}`,
          ],
          { cwd: rootDir },
        ),
      ).rejects.toThrow(/SNS daily queue blocked/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
