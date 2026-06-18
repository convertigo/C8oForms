import type { FullConfig, Reporter, Suite, TestCase, TestResult, TestStep } from '@playwright/test/reporter';

const PREFIX = '[playwright-progress]';
const VERBOSE = process.env.C8OFORMS_RUNNER_PROGRESS_VERBOSE === '1';
const SLOW_STEP_MS = Number(process.env.C8OFORMS_RUNNER_SLOW_STEP_MS ?? 1000);

function write(line: string): void {
  process.stdout.write(`${PREFIX} ${line}\n`);
}

function formatMs(ms: number | undefined): string {
  const value = Math.max(0, Math.round(ms ?? 0));
  if (value < 1000) return `${value}ms`;
  return `${Math.round(value / 100) / 10}s`;
}

function titlePath(test: TestCase): string {
  const parts = test.titlePath().filter(Boolean);
  return parts.slice(1).join(' > ') || test.title;
}

function stepDepth(step: TestStep): number {
  let depth = 0;
  let current = step.parent;
  while (current) {
    depth += 1;
    current = current.parent;
  }
  return Math.min(depth, 4);
}

function stepPrefix(step: TestStep): string {
  return `${'  '.repeat(stepDepth(step))}${step.category}: ${step.title}`;
}

function interestingApiStep(title: string): boolean {
  return /^(page\.goto|page\.waitFor|locator\.(click|dblclick|fill|type|press|hover|dragTo|waitFor|selectOption|scrollIntoViewIfNeeded)|expect\.|frameLocator\.)/.test(
    title,
  );
}

function shouldLogStepBegin(step: TestStep): boolean {
  if (VERBOSE) return true;
  if (step.category === 'hook' || step.category === 'fixture' || step.category === 'test.step') return true;
  if (step.category === 'expect') return true;
  if (step.category === 'pw:api') return interestingApiStep(step.title);
  return false;
}

function shouldLogStepEnd(step: TestStep, duration: number): boolean {
  if (step.error) return true;
  if (VERBOSE) return true;
  if (step.category === 'hook' || step.category === 'fixture' || step.category === 'test.step') return true;
  return duration >= SLOW_STEP_MS;
}

export default class RunnerProgressReporter implements Reporter {
  private readonly startedSteps = new WeakMap<TestStep, number>();
  private readonly loggedSteps = new WeakSet<TestStep>();

  onBegin(config: FullConfig, suite: Suite): void {
    write(`starting ${suite.allTests().length} test(s), workers=${config.workers}`);
  }

  onTestBegin(test: TestCase): void {
    write(`test start: ${titlePath(test)}`);
  }

  onStepBegin(_test: TestCase, _result: TestResult, step: TestStep): void {
    this.startedSteps.set(step, Date.now());
    if (!shouldLogStepBegin(step)) return;
    this.loggedSteps.add(step);
    write(`start ${stepPrefix(step)}`);
  }

  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep): void {
    const duration = step.duration ?? Date.now() - (this.startedSteps.get(step) ?? Date.now());
    if (!this.loggedSteps.has(step) && !shouldLogStepEnd(step, duration)) return;
    if (!shouldLogStepEnd(step, duration)) return;
    write(`${step.error ? 'failed' : 'done'} ${stepPrefix(step)} (${formatMs(duration)})`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    write(`test ${result.status}: ${titlePath(test)} (${formatMs(result.duration)})`);
  }
}
