# C / C++ Notes — problem solving, line by line

Live site: https://meteorboyf.github.io/SPL-in-C-Fundamentals/

Topic-wise C and C++ problem-solving notes in the order of Striver's A2Z DSA course.
Every problem has the idea, a solution with **every line explained**, the real output, and a
**visualiser** that runs the code one line at a time (variables, call stack, console, pattern grid,
trace table, and your own input).

| Page | Contents |
|---|---|
| `basics.html` | program structure, types, I/O, operators, if/else, switch, functions, C++ I/O + problems |
| `loops.html` | for / while / do-while, break/continue, nested loops + digit, divisor, prime, GCD problems |
| `sequences.html` | sums, AP/GP, alternating & fractional series, recurrences, run-until sequences (25 problems) |
| `patterns.html` | 3 methods and 52 patterns in 10 categories, from squares to the spiral matrix |

The original pattern programs (`Patterns/*.c`) live on the [`legacy`](../../tree/legacy) branch.

## How it works

- `assets/js/cinterp.js` is a small C/C++ interpreter that records a step for every line it runs.
- `assets/js/viz.js` draws the visualiser from those steps; `assets/js/site.js` renders pages and problem cards.
- Problems live in `assets/data/*.js`. Each one is a `CN.add({...})` call; the code is written with
  `//>` notes at the end of a line, which become that line's explanation (`{x}` renders as code).

## Adding a problem

```js
P({ id: 'lp-example', group: 'loops:A', title: 'My problem', level: 'easy', input: '5',
  lc: { n: 123, slug: 'leetcode-slug' },
  prompt: '<p>…</p>', idea: '<p>…</p>',
  code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", n * 2);   //> Explanation shown for this line.
    return 0;
}` });
```

Then check that the in-browser interpreter prints exactly what gcc prints:

```bash
node tools/verify.js
```
