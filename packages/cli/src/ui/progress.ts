import { c } from "./colors.js";

const { stdout } = process;

// Tracks the last integer percent written to a non-TTY stdout, so piped/
// logged output isn't spammed with one line per progress tick. Module-level
// is fine here \u2014 the CLI is one render per process invocation.
let lastNonTtyPercent: number | undefined;

/** Resets non-TTY throttling state. Exported for tests only. */
export function resetProgressThrottleForTests(): void {
  lastNonTtyPercent = undefined;
}

export function renderProgress(percent: number, stage: string, row?: number): void {
  const width = 25;
  const filled = Math.floor(percent / (100 / width));
  const empty = width - filled;
  const bar = c.progress("\u2588".repeat(filled)) + c.dim("\u2591".repeat(empty));

  const line = `  ${bar}  ${c.bold(String(Math.round(percent)) + "%")}  ${c.dim(stage)}`;

  if (stdout.isTTY) {
    if (row !== undefined) {
      stdout.write(`\x1b[${row};1H\x1b[2K${line}`);
    } else {
      stdout.write(`\r\x1b[2K${line}`);
    }
    return;
  }

  // A piped/redirected stdout has no cursor, and Node full-buffers
  // non-TTY streams by default \u2014 so carriage-return progress bars (relying
  // on \r and ANSI cursor codes) silently accumulate unseen until the
  // process exits, rather than ever becoming visible. Emit plain,
  // newline-terminated lines instead, throttled to one per integer percent
  // so a long render doesn't spam a log file with hundreds of near-
  // identical lines.
  const roundedPercent = Math.round(percent);
  if (roundedPercent === lastNonTtyPercent) return;
  lastNonTtyPercent = roundedPercent;
  stdout.write(`${roundedPercent}% ${stage}\n`);
}
