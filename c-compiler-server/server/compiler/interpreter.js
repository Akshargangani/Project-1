// This is a minimal toy interpreter for printf only
export function runC(source) {
  try {
    // Match printf statements: printf("Hello World");
    const printfMatch = source.match(/printf\(["'](.*)["']\)/);
    if (printfMatch) {
      return { ok: true, stdout: printfMatch[1] };
    }
    return { ok: true, stdout: '' };
  } catch (err) {
    return { ok: false, error: err.message || 'Unknown' };
  }
}
