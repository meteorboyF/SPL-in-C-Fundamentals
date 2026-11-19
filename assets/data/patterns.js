// Pattern problems, grouped by the technique that solves them.
// Lines ending with //> text are explained in the visualiser; {x} renders as code.
(function () {
  const P = CN.add, R = String.raw;

  // ===================================================================== A. squares
  P({ id: 'pt-square', group: 'patterns:A', title: 'Solid square', level: 'easy', grid: true, input: '4', src: 'Patterns/Square.c',
    prompt: '<p>Read <code>n</code> and print an <code>n × n</code> square of stars.</p>',
    idea: '<p>The first pattern teaches the whole idea: the <b>outer loop picks the row</b>, the <b>inner loop prints everything inside that row</b>, and <code>printf("\\n")</code> after the inner loop ends the row. Every row looks the same, so the inner loop always runs <code>n</code> times.</p>',
    formula: [['row', 'stars in this row'], ['0', 'n'], ['1', 'n'], ['…', '…'], ['row', 'n (never changes)']],
    code: R`
#include <stdio.h>

int main() {
    int n;                                  //> {n} is the side of the square: it gives both the number of rows and the number of columns.
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {     //> <b>Outer loop = rows.</b> {row} takes the values 0, 1, …, n−1, which is exactly n rows.
        for (int col = 0; col < n; col++) { //> <b>Inner loop = columns.</b> It restarts from 0 for every row and prints n things.
            printf("* ");                   //> One cell of the square. The extra space after * makes the square look square on screen (characters are taller than wide).
        }
        printf("\n");
    }
    return 0;
}`,
    complexity: 'The inner line runs n × n times → <b>O(n²)</b> time, O(1) extra space.',
    traps: ['Putting <code>printf("\\n")</code> <i>inside</i> the inner loop prints every star on its own line.', 'Using <code>row &lt;= n</code> with <code>row = 0</code> gives n+1 rows (an off-by-one error).'],
    tryit: ['Change the input to 6 and press <b>⏭ Next row</b> to watch one row at a time.', 'Print a rectangle of 3 rows and 7 columns.'] });

  P({ id: 'pt-rect', group: 'patterns:A', title: 'Rectangle of r rows and c columns', level: 'easy', grid: true, input: '3 6',
    prompt: '<p>Read two numbers <code>r</code> and <code>c</code> and print a rectangle of <code>#</code> with <code>r</code> rows and <code>c</code> columns.</p>',
    idea: '<p>Same as the square, but now the two loops have <b>different limits</b>: the outer loop counts rows up to <code>r</code>, the inner loop counts columns up to <code>c</code>. This is the best way to remember which loop is which.</p>',
    code: R`
#include <stdio.h>

int main() {
    int r, c;                           //> Two variables: number of rows and number of columns.
    scanf("%d %d", &r, &c);             //> Read both numbers in one call: the first one typed goes to {r}, the second to {c}.
    for (int row = 0; row < r; row++) { //> Outer loop limit is {r} → it decides <b>how many lines</b>.
        for (int col = 0; col < c; col++) { //> Inner loop limit is {c} → it decides <b>how long each line is</b>.
            printf("#");                //> Print one cell.
        }
        printf("\n");
    }
    return 0;
}`,
    complexity: 'O(r·c) time.',
    tryit: ['Swap the two limits (<code>row &lt; c</code>, <code>col &lt; r</code>) and predict the output before running it.'] });

  P({ id: 'pt-numsquare', group: 'patterns:A', title: 'Number square (column numbers)', level: 'easy', grid: true, input: '4',
    prompt: '<p>Print an <code>n × n</code> square where every row is <code>1 2 3 … n</code>.</p>',
    idea: '<p>When the printed value is a number, ask: <b>does it depend on the row, the column, or a counter?</b> Here every row is identical and the value grows from left to right, so it depends on the <b>column</b>: print <code>col + 1</code>.</p>',
    formula: [['cell', 'value'], ['(row, col)', 'col + 1']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n; col++) { //> {col} is 0-based, so the values are 0 … n−1.
            printf("%d ", col + 1);         //> Print {col + 1} because the problem wants 1 … n. {%d} is replaced by the number.
        }
        printf("\n");
    }
    return 0;
}`,
    tryit: ['Change it so every row prints its <i>row</i> number instead (1 1 1 1 / 2 2 2 2 / …).'] });

  // ===================================================================== B. left triangles
  P({ id: 'pt-tri', group: 'patterns:B', title: 'Right-angled triangle of stars', level: 'easy', grid: true, input: '5', src: 'Patterns/LeftRightAngledTriangle.c',
    prompt: '<p>Print a triangle where row 1 has 1 star, row 2 has 2 stars, …, row n has n stars.</p>',
    idea: '<p>Now the row length <b>changes</b>. Make the table: row 0 → 1 star, row 1 → 2 stars, row 2 → 3 stars. So the number of stars is <code>row + 1</code>, and that becomes the inner loop’s limit: <code>col &lt;= row</code>.</p>',
    formula: [['row', 'stars'], ['0', '1'], ['1', '2'], ['2', '3'], ['row', 'row + 1']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {      //> n rows.
        for (int col = 0; col <= row; col++) { //> The inner limit depends on {row}: it runs {row + 1} times (0, 1, …, row). This is what makes each line longer.
            printf("* ");                    //> One star per inner-loop turn.
        }
        printf("\n");
    }
    return 0;
}`,
    complexity: '1 + 2 + … + n = n(n+1)/2 stars → O(n²).',
    traps: ['<code>col &lt; row</code> instead of <code>col &lt;= row</code> makes the first row empty.'] });

  P({ id: 'pt-tri-inv', group: 'patterns:B', title: 'Inverted right-angled triangle', level: 'easy', grid: true, input: '5', src: 'Patterns/InvertedLeftTriangle.c',
    prompt: '<p>Row 1 has n stars, row 2 has n−1, …, the last row has 1.</p>',
    idea: '<p>Table: row 0 → n stars, row 1 → n−1, row 2 → n−2. The count goes <b>down</b> by one each row, so it is <code>n − row</code>.</p>',
    formula: [['row', 'stars'], ['0', 'n'], ['1', 'n − 1'], ['row', 'n − row']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n - row; col++) { //> Runs {n − row} times: n on the first row, then one less each row.
            printf("* ");
        }
        printf("\n");
    }
    return 0;
}`,
    tryit: ['Write the same pattern with the outer loop counting <i>down</i>: <code>for (row = n; row &gt;= 1; row--)</code> and <code>col &lt; row</code>.'] });

  P({ id: 'pt-tri-num', group: 'patterns:B', title: 'Number triangle 1 / 1 2 / 1 2 3', level: 'easy', grid: true, input: '5', src: 'Patterns/LeftTriNumber.c',
    prompt: '<p>Row k prints the numbers 1 to k.</p>',
    idea: '<p>Same shape as the star triangle. Only the <b>printed value</b> changes: inside a row the numbers go 1, 2, 3 from left to right, so the value is <code>col + 1</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col <= row; col++) { //> Same limit as the star triangle → same shape.
            printf("%d ", col + 1);            //> The value depends on the <b>column</b>, so each row restarts at 1.
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-tri-rownum', group: 'patterns:B', title: 'Row-number triangle 1 / 2 2 / 3 3 3', level: 'easy', grid: true, input: '5', src: 'Patterns/LeftTriNumber2.c',
    prompt: '<p>Row k prints the number k, k times.</p>',
    idea: '<p>The value stays the same along a row and changes from one row to the next, so it depends on the <b>row</b>: print <code>row + 1</code>. Compare this with the previous problem: same loops, one changed variable in printf.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col <= row; col++) {
            printf("%d ", row + 1);  //> The value depends on the <b>row</b>, so it is the same for the whole line.
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-tri-num-inv', group: 'patterns:B', title: 'Inverted number triangle 1 2 3 4 5 / 1 2 3 4', level: 'easy', grid: true, input: '5', src: 'Patterns/InvertedLeftTriNum.c',
    prompt: '<p>Row 1 prints 1…n, row 2 prints 1…n−1, and so on.</p>',
    idea: '<p>Shape from the inverted triangle (<code>n − row</code> items), value from the column (<code>col + 1</code>). Most patterns are a <b>shape</b> plus a <b>value rule</b> combined like this.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n - row; col++) { //> Shape: n − row items in this row.
            printf("%d ", col + 1);               //> Value: column number, restarting at 1.
        }
        printf("\n");
    }
    return 0;
}`,
  });

  // ===================================================================== C. right-aligned
  P({ id: 'pt-rtri', group: 'patterns:C', title: 'Right-aligned triangle', level: 'easy', grid: true, input: '5', src: 'Patterns/RightRightAngledTri.c',
    prompt: '<p>The star triangle, but pushed to the right edge:</p><pre class="console">    *\n   **\n  ***\n ****\n*****</pre>',
    idea: '<p>A row is now <b>two parts</b>: first some spaces, then some stars. Make a table with <b>two columns</b>. Spaces go 4, 3, 2, 1, 0 → <code>n − row − 1</code>. Stars go 1, 2, 3, 4, 5 → <code>row + 1</code>. Each part gets its own inner loop, one after the other.</p>',
    formula: [['row', 'spaces', 'stars'], ['0', 'n − 1', '1'], ['1', 'n − 2', '2'], ['row', 'n − row − 1', 'row + 1']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n - row - 1; col++) { //> <b>Part 1 — spaces.</b> {n − row − 1} spaces push the stars to the right.
            printf(" ");                              //> Print one space (watch the grey dots in the pattern grid).
        }
        for (int col = 0; col <= row; col++) {        //> <b>Part 2 — stars.</b> This loop starts only after the space loop has finished. It prints {row + 1} stars.
            printf("*");
        }
        printf("\n");
    }
    return 0;
}`,
    traps: ['Forgetting that spaces are characters too: in the pattern grid, the grey cells are real spaces that your code printed.', 'If you print <code>"* "</code> (star plus space), the spaces must be <code>"  "</code> (two spaces) to keep the alignment.'] });

  P({ id: 'pt-rtri-inv', group: 'patterns:C', title: 'Inverted right-aligned triangle', level: 'easy', grid: true, input: '5', src: 'Patterns/InvertedRightTri.c',
    prompt: '<p>Stars decrease, while spaces on the left increase:</p><pre class="console">*****\n ****\n  ***\n   **\n    *</pre>',
    idea: '<p>Spaces go 0, 1, 2 → <code>row</code>. Stars go n, n−1, … → <code>n − row</code>. The two counts always add up to <code>n</code> (the width), which is a quick way to check any right-aligned pattern.</p>',
    formula: [['row', 'spaces', 'stars', 'sum'], ['0', '0', 'n', 'n'], ['1', '1', 'n − 1', 'n'], ['row', 'row', 'n − row', 'n']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < row; col++) {     //> {row} spaces: none on the first line, one more each line.
            printf(" ");
        }
        for (int col = 0; col < n - row; col++) { //> {n − row} stars.
            printf("*");
        }
        printf("\n");
    }
    return 0;
}`,
  });

  // ===================================================================== D. characters
  P({ id: 'pt-abc', group: 'patterns:D', title: 'Alphabet triangle A / A B / A B C', level: 'easy', grid: true, input: '5', src: 'Patterns/pattern13.c',
    prompt: '<p>Row k prints the first k capital letters.</p>',
    idea: '<p>A <code>char</code> is just a small number: <code>\'A\'</code> is 65, <code>\'B\'</code> is 66, and so on. So <code>\'A\' + col</code> is the col-th letter, and <code>%c</code> prints the number as a character.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col <= row; col++) {  //> Triangle shape: row + 1 items.
            printf("%c ", 'A' + col);           //> {'A' + col} → 65 + col. {%c} prints that code as a letter: col 0 → A, col 1 → B …
        }
        printf("\n");
    }
    return 0;
}`,
    traps: ['<code>%d</code> instead of <code>%c</code> prints 65 66 67 instead of letters.'] });

  P({ id: 'pt-abc-inv', group: 'patterns:D', title: 'Inverted alphabet triangle A B C D E / A B C D', level: 'easy', grid: true, input: '5', src: 'Patterns/pattern13.1.c',
    prompt: '<p>Row 1 prints A to the n-th letter, and every next row prints one letter less.</p>',
    idea: '<p>Your legacy file uses a <code>char</code> as the loop variable: <code>for (char ch = \'A\'; ch &lt;= \'A\' + (n − row − 1); ch++)</code>. Because chars are numbers, <code>ch++</code> moves to the next letter.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (char ch = 'A'; ch <= 'A' + (n - row - 1); ch++) { //> The loop variable itself is a letter. The last letter is {'A' + (n − row − 1)}, which gets one earlier each row.
            printf("%c ", ch);                                 //> Print the current letter.
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-abc-row', group: 'patterns:D', title: 'Letter-per-row triangle A / B B / C C C', level: 'easy', grid: true, input: '5', src: 'Patterns/pattern14.c',
    prompt: '<p>Row k prints the k-th letter, k times.</p>',
    idea: '<p>The letter depends on the <b>row</b> only, so pick it once <i>before</i> the inner loop and reuse it.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        char ch = 'A' + row;                 //> Decide this row’s letter once: row 0 → A, row 1 → B …
        for (int col = 0; col <= row; col++) {
            printf("%c ", ch);               //> Same letter for the whole row.
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-abc-tail', group: 'patterns:D', title: 'Ending-letter triangle E / D E / C D E', level: 'medium', grid: true, input: '5', src: 'Patterns/pattern16.c',
    prompt: '<p>For n = 5: the last letter is always E, and each row starts one letter earlier.</p>',
    idea: '<p>Find the <b>start</b> and <b>end</b> letter of each row. The end is always the n-th letter <code>\'A\' + n − 1</code>. The start goes E, D, C … which is <code>last − row</code>. Then loop from start to end.</p>',
    formula: [['row', 'first letter', 'last letter'], ['0', "'A'+n−1", "'A'+n−1"], ['1', "'A'+n−2", "'A'+n−1"], ['row', "'A'+n−1−row", "'A'+n−1"]],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    char last = 'A' + n - 1;                  //> The n-th letter (E when n = 5). Every row ends here.
    for (int row = 0; row < n; row++) {
        for (char ch = last - row; ch <= last; ch++) { //> Start {row} letters before the end and walk forward to {last}.
            printf("%c ", ch);
        }
        printf("\n");
    }
    return 0;
}`,
  });

  // ===================================================================== E. counters / parity
  P({ id: 'pt-floyd', group: 'patterns:E', title: "Floyd's triangle 1 / 2 3 / 4 5 6", level: 'easy', grid: true, input: '5',
    prompt: '<p>Print the numbers 1, 2, 3, … continuously, filling a triangle row by row.</p>',
    idea: '<p>The value doesn’t depend on <code>row</code> or <code>col</code> on its own. It is “how many numbers have been printed so far”. Keep a <b>counter</b> variable declared <i>outside both loops</i>, so it doesn’t reset when a new row starts.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int num = 1;                              //> The counter is declared <b>outside</b> both loops, so it keeps its value from row to row.
    for (int row = 0; row < n; row++) {
        for (int col = 0; col <= row; col++) {
            printf("%d ", num);               //> Print the current counter value …
            num++;                            //> … then move to the next number.
        }
        printf("\n");
    }
    return 0;
}`,
    traps: ['Declaring <code>num</code> inside the outer loop resets it to 1 on every row.'] });

  P({ id: 'pt-01tri', group: 'patterns:E', title: '0-1 triangle 1 / 0 1 / 1 0 1', level: 'medium', grid: true, input: '5',
    prompt: '<p>Striver pattern 11:</p><pre class="console">1\n0 1\n1 0 1\n0 1 0 1\n1 0 1 0 1</pre>',
    idea: '<p>Each row alternates 1 and 0. Only the <b>first value</b> changes: even rows start with 1, odd rows start with 0. Set <code>start</code> from the row’s parity, then flip it with <code>start = 1 − start</code> after every print.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        int start = (row % 2 == 0) ? 1 : 0;  //> {row % 2} is 0 for even rows → start with 1, otherwise start with 0. {? :} is a short if-else.
        for (int col = 0; col <= row; col++) {
            printf("%d ", start);
            start = 1 - start;               //> Flip: 1 becomes 0 and 0 becomes 1.
        }
        printf("\n");
    }
    return 0;
}`,
    tryit: ['A shorter version: print <code>(row + col + 1) % 2</code> directly. Check that it gives the same output.'] });

  P({ id: 'pt-checker', group: 'patterns:E', title: 'Checkerboard', level: 'easy', grid: true, input: '6',
    prompt: '<p>Print an n × n board where <code>#</code> and <code>.</code> alternate both across and down.</p>',
    idea: '<p>On a chessboard, a cell’s colour depends on <b>row + col</b>: if it is even the cell is one colour, if odd the other. This is the first pattern where we use a <b>condition on each cell</b>, which the letter shapes later use all the time.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n; col++) {
            if ((row + col) % 2 == 0) {      //> Even sum → black square. Moving one step right or down changes the sum by 1 and flips the colour.
                printf("#");
            } else {
                printf(".");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  // ===================================================================== F. pyramids
  P({ id: 'pt-pyramid', group: 'patterns:F', title: 'Star pyramid', level: 'easy', grid: true, input: '5', src: 'Patterns/Pyramid.c',
    prompt: '<p>A centred pyramid where row k has 2k − 1 stars:</p><pre class="console">    *\n   ***\n  *****\n *******\n*********</pre>',
    idea: '<p>Two parts again. Stars go 1, 3, 5, 7 (odd numbers) → <code>2·row + 1</code>. Spaces go 4, 3, 2, 1 → <code>n − row − 1</code>. Spaces after the stars are not needed (they are invisible).</p>',
    formula: [['row', 'spaces', 'stars'], ['0', 'n − 1', '1'], ['1', 'n − 2', '3'], ['2', 'n − 3', '5'], ['row', 'n − row − 1', '2·row + 1']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n - row - 1; col++) { //> Left spaces: one less on every row, so the pyramid widens to the left.
            printf(" ");
        }
        for (int col = 0; col < 2 * row + 1; col++) { //> Odd number of stars: 1, 3, 5 … The middle star sits exactly below the one above.
            printf("*");
        }
        printf("\n");
    }
    return 0;
}`,
    traps: ['<code>col &lt; 2 * row</code> gives 0, 2, 4 stars, so the pyramid has no tip.'] });

  P({ id: 'pt-pyramid-inv', group: 'patterns:F', title: 'Inverted pyramid', level: 'easy', grid: true, input: '5', src: 'Patterns/InvertedPyramid.c',
    prompt: '<p>The pyramid upside down.</p>',
    idea: '<p>Swap the direction of both counts: spaces grow (<code>row</code>), stars shrink by 2 each row (<code>2·(n − row) − 1</code>).</p>',
    formula: [['row', 'spaces', 'stars'], ['0', '0', '2n − 1'], ['1', '1', '2n − 3'], ['row', 'row', '2(n − row) − 1']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < row; col++) {               //> Spaces grow: 0, 1, 2 …
            printf(" ");
        }
        for (int col = 0; col < 2 * (n - row) - 1; col++) { //> Stars shrink by two: 2n−1, 2n−3, … 1.
            printf("*");
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-pyramid-trick', group: 'patterns:F', title: 'Pyramid with the “star + space” trick', level: 'easy', grid: true, input: '5',
    prompt: '<p>The same pyramid shape, built a different way: <code>row + 1</code> copies of <code>"* "</code> after the spaces.</p>',
    idea: '<p>Printing <code>"* "</code> (2 characters) per item makes each row grow by 2 characters, but the left spaces shrink by 1. This automatically centres the row, so you don’t need the <code>2·row + 1</code> formula. It works for numbers too (<code>"%d "</code>).</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n - row - 1; col++) { //> Same left spaces as the normal pyramid.
            printf(" ");
        }
        for (int col = 0; col <= row; col++) {        //> Only {row + 1} items …
            printf("* ");                             //> … but each item is 2 characters wide, so the row is centred automatically.
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-num-pyramid', group: 'patterns:F', title: 'Palindrome number pyramid 1 / 1 2 1 / 1 2 3 2 1', level: 'medium', grid: true, input: '5',
    prompt: '<pre class="console">    1\n   121\n  12321\n 1234321\n123454321</pre>',
    idea: '<p>Split each row into <b>three parts</b>: spaces, an <b>increasing</b> half <code>1 … row+1</code>, and a <b>decreasing</b> half <code>row … 1</code>. The middle number appears only once, because the second loop starts one lower.</p>',
    formula: [['row', 'spaces', 'up part', 'down part'], ['0', 'n−1', '1', '—'], ['1', 'n−2', '1 2', '1'], ['row', 'n−row−1', '1…row+1', 'row…1']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n - row - 1; col++) { //> Part 1: spaces.
            printf(" ");
        }
        for (int k = 1; k <= row + 1; k++) {          //> Part 2: count <b>up</b> from 1 to row + 1 (the peak).
            printf("%d", k);
        }
        for (int k = row; k >= 1; k--) {              //> Part 3: count <b>down</b> from row to 1. It starts at {row}, not {row + 1}, so the peak is not printed twice.
            printf("%d", k);
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-abc-pyramid', group: 'patterns:F', title: 'Alphabet pyramid A / ABA / ABCBA', level: 'medium', grid: true, input: '5', src: 'Patterns/pattern15.c',
    prompt: '<pre class="console">    A\n   ABA\n  ABCBA\n ABCDCBA\nABCDEDCBA</pre>',
    idea: '<p>Same as the number pyramid, but walking a <code>char</code>: go <b>up</b> while you are left of the middle and <b>down</b> after it. Your legacy file uses one loop with a <code>breaking</code> point. Here we use one variable <code>ch</code>, increased in the first half and decreased in the second.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n - row - 1; col++) {
            printf(" ");
        }
        char ch = 'A';                                //> Every row starts at A.
        int mid = row;                                //> The middle position of a row with {2·row + 1} letters is index {row}.
        for (int col = 0; col < 2 * row + 1; col++) { //> One loop over all letters of the row.
            printf("%c", ch);
            if (col < mid) {                          //> Left of the middle → the next letter goes up …
                ch++;
            } else {                                  //> … at or after the middle → the next letter goes down.
                ch--;
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  // ===================================================================== G. diamonds & mirrored
  P({ id: 'pt-diamond', group: 'patterns:G', title: 'Diamond', level: 'medium', grid: true, input: '5', src: 'Patterns/Diamond.c',
    prompt: '<p>A pyramid on top of an inverted pyramid (the widest row is printed once).</p>',
    idea: '<p>A diamond is <b>two patterns you already know</b>, one after the other: the pyramid (rows 0…n−1) and the inverted pyramid without its first row (so the widest row is not repeated). Write two separate outer loops.</p>',
    formula: [['half', 'rows', 'spaces', 'stars'], ['top', 'row = 0 … n−1', 'n − row − 1', '2·row + 1'], ['bottom', 'row = 1 … n−1', 'row', '2(n − row) − 1']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {               //> <b>Top half</b> = the normal pyramid.
        for (int col = 0; col < n - row - 1; col++) printf(" "); //> Spaces (a one-line loop: the body is just this printf).
        for (int col = 0; col < 2 * row + 1; col++) printf("*");  //> Stars 1, 3, 5 …
        printf("\n");
    }
    for (int row = 1; row < n; row++) {               //> <b>Bottom half</b> starts at row 1 so the widest line is not printed twice.
        for (int col = 0; col < row; col++) printf(" ");
        for (int col = 0; col < 2 * (n - row) - 1; col++) printf("*"); //> Stars shrink by 2.
        printf("\n");
    }
    return 0;
}`,
    traps: ['Starting the bottom loop at 0 prints the middle row twice (a “fat” diamond).'] });

  P({ id: 'pt-halfdiamond', group: 'patterns:G', title: 'Half diamond (left arrow) *, **, ***, **, *', level: 'easy', grid: true, input: '4', src: 'Patterns/DiamondLeftAlign.c',
    prompt: '<p>Stars grow from 1 to n, then shrink back to 1, all left-aligned (2n − 1 rows).</p>',
    idea: '<p>A <b>single</b> loop over <code>2n − 1</code> rows also works. Compute the star count: while <code>row &lt; n</code> it is <code>row + 1</code>, after that it is <code>2n − row − 1</code>. Changing a formula partway through the rows is the main idea behind every mirrored pattern.</p>',
    formula: [['row', 'stars'], ['0 … n−1', 'row + 1'], ['n … 2n−2', '2n − row − 1']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < 2 * n - 1; row++) { //> One loop for both halves: 2n − 1 lines in total.
        int stars = row + 1;                    //> Going up: 1, 2, … n.
        if (row >= n) {
            stars = 2 * n - row - 1;            //> Past the middle: n−1, n−2, … 1.
        }
        for (int col = 0; col < stars; col++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-rhalfdiamond', group: 'patterns:G', title: 'Right half diamond (right arrow)', level: 'medium', grid: true, input: '4', src: 'Patterns/DiamondRightAligned.c',
    prompt: '<p>Like the half diamond, but aligned to the right edge.</p>',
    idea: '<p>Add a space count that mirrors the star count: <code>spaces = n − stars</code>. It is the same “always adds up to the width” check as before.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < 2 * n - 1; row++) {
        int stars = (row < n) ? row + 1 : 2 * n - row - 1; //> Same star count as the left half diamond, written with {? :}.
        int spaces = n - stars;                             //> Spaces + stars = n on every line.
        for (int col = 0; col < spaces; col++) printf(" ");
        for (int col = 0; col < stars; col++) printf("*");
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-hourglass', group: 'patterns:G', title: 'Hourglass', level: 'medium', grid: true, input: '4', src: 'Patterns/DiamondHourglass.c',
    prompt: '<p>An inverted pyramid followed by a pyramid that shares the 1-star waist.</p>',
    idea: '<p>This is the diamond with the two halves <b>swapped</b>. The top half is the inverted pyramid. The bottom half is the pyramid starting from row 1, so the single-star waist is printed once.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {               //> Top: inverted pyramid.
        for (int col = 0; col < row; col++) printf(" ");
        for (int col = 0; col < 2 * (n - row) - 1; col++) printf("*");
        printf("\n");
    }
    for (int row = 1; row < n; row++) {               //> Bottom: pyramid without its 1-star tip (row 0), which was already printed as the waist.
        for (int col = 0; col < n - row - 1; col++) printf(" ");
        for (int col = 0; col < 2 * row + 1; col++) printf("*");
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-butterfly', group: 'patterns:G', title: 'Butterfly', level: 'medium', grid: true, input: '4', src: 'Patterns/DiamondButterfly.c',
    prompt: '<pre class="console">*      *\n**    **\n***  ***\n********\n***  ***\n**    **\n*      *</pre>',
    idea: '<p>Each line is <b>stars, gap, stars</b>. The stars follow the half-diamond count (1…n…1), and the gap is whatever is left: <code>2n − 2·stars</code>. Your legacy version keeps a running <code>space</code> variable that goes −2 then +2. This version computes it directly from <code>stars</code>.</p>',
    formula: [['row', 'stars (each side)', 'gap'], ['0', '1', '2n − 2'], ['n − 1', 'n', '0'], ['any', 'row<n ? row+1 : 2n−row−1', '2n − 2·stars']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < 2 * n - 1; row++) {
        int stars = (row < n) ? row + 1 : 2 * n - row - 1; //> Half-diamond count: 1, 2, … n, … 2, 1.
        int gap = 2 * n - 2 * stars;                        //> Total width is 2n, so the gap is what the two wings leave over.
        for (int col = 0; col < stars; col++) printf("*");  //> Left wing.
        for (int col = 0; col < gap; col++) printf(" ");    //> Middle gap.
        for (int col = 0; col < stars; col++) printf("*");  //> Right wing (same size as the left one).
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-window', group: 'patterns:G', title: 'Diamond window (Striver pattern 19)', level: 'medium', grid: true, input: '5', src: 'Patterns/pattern17.c',
    prompt: '<pre class="console">**********\n****  ****\n***    ***\n**      **\n*        *\n*        *\n**      **\n***    ***\n****  ****\n**********</pre>',
    idea: '<p>This is the butterfly <b>turned inside out</b>: the stars shrink while the gap grows (top half), then the opposite (bottom half). Each half is one loop with three parts.</p>',
    formula: [['half', 'stars each side', 'gap'], ['top, row 0…n−1', 'n − row', '2·row'], ['bottom, row 0…n−1', 'row + 1', '2(n − row − 1)']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {                      //> Top half: the gap opens up.
        for (int col = 0; col < n - row; col++) printf("*"); //> n, n−1, … stars.
        for (int col = 0; col < 2 * row; col++) printf(" "); //> 0, 2, 4 … spaces.
        for (int col = 0; col < n - row; col++) printf("*");
        printf("\n");
    }
    for (int row = 0; row < n; row++) {                      //> Bottom half: the gap closes again.
        for (int col = 0; col <= row; col++) printf("*");    //> 1, 2, … stars.
        for (int col = 0; col < 2 * (n - row - 1); col++) printf(" "); //> … 4, 2, 0 spaces.
        for (int col = 0; col <= row; col++) printf("*");
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-cone', group: 'patterns:G', title: 'Number cone 1      1 / 12    21 (Striver 12)', level: 'medium', grid: true, input: '4', src: 'Patterns/ConeNumbered.c',
    prompt: '<pre class="console">1      1\n12    21\n123  321\n12344321</pre>',
    idea: '<p>This is the butterfly’s top half with <b>numbers</b>: count up on the left, leave a gap, count down on the right. The gap starts at <code>2(n − 1)</code> and shrinks by 2 every row, so we keep it in a variable and subtract 2 at the end of each row.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int gap = 2 * (n - 1);                  //> First row: 1 number, gap, 1 number → total width 2n, so the gap is 2n − 2.
    for (int row = 1; row <= n; row++) {    //> 1-based rows here, because the numbers printed are 1 … row.
        for (int k = 1; k <= row; k++) printf("%d", k);  //> Count up: 1 2 … row.
        for (int k = 0; k < gap; k++) printf(" ");       //> The gap.
        for (int k = row; k >= 1; k--) printf("%d", k);  //> Count down: row … 2 1.
        printf("\n");
        gap -= 2;                           //> Each row adds one number on each side, so the gap loses 2.
    }
    return 0;
}`,
  });

  P({ id: 'pt-arrow', group: 'patterns:G', title: 'Chevron (>) pattern', level: 'medium', grid: true, input: '4',
    prompt: '<pre class="console">*\n *\n  *\n   *\n  *\n *\n*</pre>',
    idea: '<p>Only <b>one star per row</b>, placed after a number of spaces that goes 0, 1, … n−1, … 1, 0. That is the half-diamond count shifted by one, i.e. the distance from the first row going down and back up.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < 2 * n - 1; row++) {
        int spaces = (row < n) ? row : 2 * n - 2 - row; //> 0, 1, … n−1, then back down to 0.
        for (int col = 0; col < spaces; col++) printf(" ");
        printf("*\n");                                  //> The single star and the end of the line, in one printf.
    }
    return 0;
}`,
  });

  // ===================================================================== H. hollow
  P({ id: 'pt-hsquare', group: 'patterns:H', title: 'Hollow square', level: 'easy', grid: true, input: '5', src: 'Patterns/SquareHollow.c',
    prompt: '<p>Only the border of an n × n square.</p>',
    idea: '<p>Every hollow pattern uses the same trick: <b>loop over every cell as if the shape were solid</b>, then for each cell decide <code>*</code> or space. For a square, a cell is on the border when it is in the first or last row, or the first or last column.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n; col++) {
            if (row == 0 || row == n - 1 || col == 0 || col == n - 1) { //> Border test: top row, bottom row, left column or right column. {||} means “or” — one true part is enough.
                printf("*");
            } else {
                printf(" ");                                             //> Inside cell → print a space so the next star lands in the right column.
            }
        }
        printf("\n");
    }
    return 0;
}`,
    traps: ['Not printing anything for inside cells makes the right border collapse onto the left one, because spaces are needed to fill the gap.'] });

  P({ id: 'pt-htri', group: 'patterns:H', title: 'Hollow right triangle', level: 'easy', grid: true, input: '5', src: 'Patterns/LeftRightAngleTriaHollow.c',
    prompt: '<pre class="console">*\n**\n* *\n*  *\n*****</pre>',
    idea: '<p>Start from the solid triangle (<code>col &lt;= row</code>) and keep only its three edges: the <b>left edge</b> <code>col == 0</code>, the <b>slanted edge</b> <code>col == row</code>, and the <b>bottom</b> <code>row == n − 1</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col <= row; col++) {             //> Solid triangle shape …
            if (col == 0 || col == row || row == n - 1) {   //> … but print a star only on its 3 edges.
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-htri-inv', group: 'patterns:H', title: 'Hollow inverted triangle', level: 'easy', grid: true, input: '5', src: 'Patterns/InvertedLeftTriHollow.c',
    prompt: '<pre class="console">*****\n*  *\n* *\n**\n*</pre>',
    idea: '<p>The solid shape is the inverted triangle (<code>n − row</code> cells). Its edges are the top row, the first column, and the <b>last cell of each row</b>, which is <code>col == n − row − 1</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n - row; col++) {
            if (row == 0 || col == 0 || col == n - row - 1) { //> Top edge, left edge, and the last cell of this row (the slanted edge).
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-hpyramid', group: 'patterns:H', title: 'Hollow pyramid', level: 'medium', grid: true, input: '5',
    prompt: '<pre class="console">    *\n   * *\n  *   *\n *     *\n*********</pre>',
    idea: '<p>Keep the pyramid’s space loop as it is. In the star loop, cell <code>col</code> runs from 0 to <code>2·row</code>. The edges are the first cell (<code>col == 0</code>), the last cell (<code>col == 2·row</code>), and the whole bottom row.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n - row - 1; col++) printf(" ");
        for (int col = 0; col < 2 * row + 1; col++) {
            if (col == 0 || col == 2 * row || row == n - 1) { //> First cell, last cell, or bottom row.
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-hdiamond', group: 'patterns:H', title: 'Hollow diamond', level: 'medium', grid: true, input: '5', src: 'Patterns/DiamondMiddleHollow.c',
    prompt: '<p>Only the outline of the diamond.</p>',
    idea: '<p>This is the diamond’s two halves with the hollow-pyramid test. In both halves a row has <code>w</code> cells, and only the first and last (<code>col == 0 || col == w − 1</code>) are stars.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {                //> Top half.
        int w = 2 * row + 1;                           //> Width of this row’s star area.
        for (int col = 0; col < n - row - 1; col++) printf(" ");
        for (int col = 0; col < w; col++) {
            printf((col == 0 || col == w - 1) ? "*" : " "); //> {? :} chooses which string to print: a star on the two ends, a space inside.
        }
        printf("\n");
    }
    for (int row = n - 2; row >= 0; row--) {           //> Bottom half: walk the same rows <b>backwards</b> (n−2 down to 0). This is another way to mirror.
        int w = 2 * row + 1;
        for (int col = 0; col < n - row - 1; col++) printf(" ");
        for (int col = 0; col < w; col++) {
            printf((col == 0 || col == w - 1) ? "*" : " ");
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-hbutterfly', group: 'patterns:H', title: 'Hollow butterfly', level: 'hard', grid: true, input: '4', src: 'Patterns/DiamondButterflyHollow.c',
    prompt: '<pre class="console">*      *\n**    **\n* *  * *\n*  **  *\n* *  * *\n**    **\n*      *</pre>',
    idea: '<p>Butterfly + hollow test. Each wing is <code>stars</code> cells wide. Keep a cell only if it is the wing’s first or last cell (<code>c == 0 || c == stars − 1</code>). The middle gap doesn’t change.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < 2 * n - 1; row++) {
        int stars = (row < n) ? row + 1 : 2 * n - row - 1;
        int gap = 2 * n - 2 * stars;
        for (int c = 0; c < stars; c++) printf((c == 0 || c == stars - 1) ? "*" : " "); //> Left wing, only its outline.
        for (int c = 0; c < gap; c++) printf(" ");
        for (int c = 0; c < stars; c++) printf((c == 0 || c == stars - 1) ? "*" : " "); //> Right wing, only its outline.
        printf("\n");
    }
    return 0;
}`,
  });

  // ===================================================================== I. letter shapes (grid method)
  const letterIdea = (cond, extra) => '<p><b>Grid method:</b> picture the letter inside a box, loop over <b>every cell</b> of the box, and print <code>*</code> only when the cell lies on one of the letter’s strokes: <code>' + cond + '</code>. ' + (extra || '') + '</p>';

  P({ id: 'pt-x', group: 'patterns:I', title: 'Letter X', level: 'medium', grid: true, input: '5', src: 'Patterns/ShapeX.c',
    prompt: '<p>Print an X inside an n × n box (odd n looks best).</p>',
    idea: letterIdea('row == col || row + col == n − 1', 'The main diagonal is every cell where <code>row == col</code>. The other diagonal is every cell where <code>row + col == n − 1</code>. Check it in the pattern grid: row 1 col 3 → 1 + 3 = 4 = n − 1 for n = 5.'),
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {          //> Grid method: visit every cell of the n × n box …
        for (int col = 0; col < n; col++) {
            if (row == col || row + col == n - 1) { //> … and print a star only on the two diagonals. \ diagonal: {row == col}. / diagonal: {row + col == n − 1}.
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-z', group: 'patterns:I', title: 'Letter Z', level: 'medium', grid: true, input: '5', src: 'Patterns/ShapeZ.c',
    prompt: '<p>Top bar, bottom bar and the / diagonal.</p>',
    idea: letterIdea('row == 0 || row == n − 1 || row + col == n − 1'),
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n; col++) {
            if (row == 0 ||               //> Top bar …
                row == n - 1 ||           //> … bottom bar …
                row + col == n - 1) {     //> … or the / diagonal that joins them.
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-v', group: 'patterns:I', title: 'Letter V', level: 'medium', grid: true, input: '5', src: 'Patterns/ShapeV.c',
    prompt: '<p>A V with n rows (so the box is 2n − 1 wide).</p>',
    idea: letterIdea('col == row || col == 2n − 2 − row', 'The left stroke moves one column right per row. The right stroke is its mirror image: start at the last column <code>2n − 2</code> and move left.'),
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < 2 * n - 1; col++) {         //> The box is 2n − 1 columns wide, so the two strokes can meet in the middle.
            if (col == row || col == 2 * n - 2 - row) {      //> Left stroke (goes right) or right stroke (goes left).
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
    tryit: ['The V prints spaces up to the right edge on every row. Can you stop the inner loop at <code>col &lt;= 2*n - 2 - row</code> so no trailing spaces are printed?'] });

  P({ id: 'pt-h', group: 'patterns:I', title: 'Letter H', level: 'easy', grid: true, input: '5', src: 'Patterns/ShapeH.c',
    prompt: '<p>Two vertical bars joined in the middle.</p>',
    idea: letterIdea('col == 0 || col == n − 1 || row == n / 2', '<code>n / 2</code> is integer division, so for n = 5 it gives 2, the middle row.'),
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n; col++) {
            if (col == 0 || col == n - 1 || row == n / 2) { //> Left bar, right bar, or the middle row ({n / 2} drops the remainder: 5 / 2 = 2).
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-n', group: 'patterns:I', title: 'Letter N', level: 'easy', grid: true, input: '5',
    prompt: '<p>Two vertical bars joined by the \\ diagonal.</p>',
    idea: letterIdea('col == 0 || col == n − 1 || col == row'),
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n; col++) {
            if (col == 0 || col == n - 1 || col == row) { //> Left bar, right bar, or the \ diagonal.
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-plus', group: 'patterns:I', title: 'Plus sign (+)', level: 'easy', grid: true, input: '5',
    prompt: '<p>A plus sign in an n × n box.</p>',
    idea: letterIdea('row == n / 2 || col == n / 2'),
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n; col++) {
            if (row == n / 2 || col == n / 2) { //> Middle row or middle column.
                printf("+");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-y', group: 'patterns:I', title: 'Letter Y', level: 'medium', grid: true, input: '5', src: 'Patterns/ShapeY.c',
    prompt: '<p>A V in the top half and a vertical stem in the bottom half.</p>',
    idea: letterIdea('(row ≤ mid && (col == row || col == n−1−row)) || (row > mid && col == mid)', 'Here the condition itself depends on <b>which half</b> you are in, so we test <code>row &lt;= mid</code> first.'),
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int mid = n / 2;                                       //> The middle row / column.
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n; col++) {
            int star;                                      //> Will be 1 (print a star) or 0 (print a space).
            if (row <= mid) {
                star = (col == row || col == n - 1 - row); //> Top half: the two arms of the V. A comparison gives 1 if true and 0 if false.
            } else {
                star = (col == mid);                       //> Bottom half: just the stem.
            }
            printf(star ? "*" : " ");
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-k', group: 'patterns:I', title: 'Letter K', level: 'hard', grid: true, input: '7', src: 'Patterns/ShapeK.c',
    prompt: '<p>A vertical bar and two arms that meet at the middle row.</p>',
    idea: letterIdea('col == 0 || col == |row − mid|', 'The arm’s column is the <b>distance from the middle row</b>, written with <code>abs()</code>. That distance goes mid, …, 1, 0, 1, …, mid, which is exactly a &lt; shape. <code>abs</code> is the main tool for mirrored patterns, and you will see it again in the hard section.'),
    code: R`
#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    scanf("%d", &n);
    int mid = n / 2;
    for (int row = 0; row < n; row++) {
        for (int col = 0; col <= mid; col++) {          //> The box is only mid + 1 wide.
            if (col == 0 || col == abs(row - mid)) {    //> Vertical bar, or the arm. {abs(row − mid)} = how far this row is from the middle row.
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-w', group: 'patterns:I', title: 'Letter W', level: 'hard', grid: true, input: '4', src: 'Patterns/ShapeW.c',
    prompt: '<p>Two V’s side by side, sharing the middle stroke.</p>',
    idea: letterIdea('col == row || col == 2n−2−row || col == 2n−2+row || col == 4n−4−row', 'Four strokes: two going down-right (<code>start + row</code>) and two going down-left (<code>start − row</code>). The box is <code>4n − 3</code> wide.'),
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int w = 4 * n - 3;                               //> Two V’s of width 2n − 1 sharing one column → 4n − 3.
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < w; col++) {
            if (col == row || col == 2 * n - 2 - row ||          //> First V: stroke going right, stroke going left.
                col == 2 * n - 2 + row || col == 4 * n - 4 - row) { //> Second V, shifted right by 2n − 2.
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  // ===================================================================== J. mixed & hard
  P({ id: 'pt-concentric', group: 'patterns:J', title: 'Concentric number square (Striver 22)', level: 'hard', grid: true, input: '4',
    prompt: '<pre class="console">4 4 4 4 4 4 4\n4 3 3 3 3 3 4\n4 3 2 2 2 3 4\n4 3 2 1 2 3 4\n4 3 2 2 2 3 4\n4 3 3 3 3 3 4\n4 4 4 4 4 4 4</pre>',
    idea: '<p>The hardest of Striver’s 22, and very easy once you see it. For each cell, measure its distance to the <b>four walls</b>: top <code>row</code>, left <code>col</code>, bottom <code>size−1−row</code>, right <code>size−1−col</code>. The <b>closest wall</b> decides which ring the cell is in. Ring 0 prints n, ring 1 prints n−1, and so on, so the value is <code>n − min(distances)</code>.</p>',
    formula: [['distance to', 'formula'], ['top', 'row'], ['left', 'col'], ['bottom', 'size − 1 − row'], ['right', 'size − 1 − col'], ['value', 'n − min(all four)']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int size = 2 * n - 1;                       //> The square is 2n − 1 cells on each side.
    for (int row = 0; row < size; row++) {
        for (int col = 0; col < size; col++) {
            int top = row, left = col;          //> Distance to the top wall and to the left wall.
            int bottom = size - 1 - row;        //> Distance to the bottom wall.
            int right = size - 1 - col;         //> Distance to the right wall.
            int d = top;                        //> Find the smallest of the four distances, step by step.
            if (left < d) d = left;
            if (bottom < d) d = bottom;
            if (right < d) d = right;
            printf("%d ", n - d);               //> Outer ring (d = 0) prints n, the centre (d = n − 1) prints 1.
        }
        printf("\n");
    }
    return 0;
}`,
    tryit: ['Print letters instead: <code>printf("%c ", \'A\' + d)</code>.'] });

  P({ id: 'pt-pascal', group: 'patterns:J', title: "Pascal's triangle", level: 'hard', grid: true, input: '6', lc: { n: 118, slug: 'pascals-triangle' },
    prompt: '<p>Each number is the sum of the two numbers above it. Print the first n rows, centred.</p>',
    idea: '<p>Row <code>r</code> contains <code>C(r,0), C(r,1), …, C(r,r)</code>. You don’t need factorials: going from one entry to the next, <code>C(r, k+1) = C(r, k) × (r − k) / (k + 1)</code>. Start every row with <code>val = 1</code> and update it after each print. Centre the rows with the “<code>"%d "</code> after spaces” trick.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int s = 0; s < n - row - 1; s++) printf(" "); //> Centring spaces (the pyramid trick).
        int val = 1;                                       //> C(row, 0) = 1: every row starts with 1.
        for (int k = 0; k <= row; k++) {
            printf("%d ", val);
            val = val * (row - k) / (k + 1);               //> Next binomial coefficient C(row, k+1). Multiply first, then divide. In this order the division is always exact.
        }
        printf("\n");
    }
    return 0;
}`,
    traps: ['Writing <code>val *= (row - k) / (k + 1)</code> divides first with integer division and gives wrong numbers.'] });

  P({ id: 'pt-zigzag', group: 'patterns:J', title: 'Zig-zag wave', level: 'hard', grid: true, input: '13',
    prompt: '<pre class="console">  *   *   *\n * * * * * *\n*   *   *   *</pre><p>Three rows. The input is the width.</p>',
    idea: '<p>The wave repeats every <b>4 columns</b>, so use <code>% 4</code>. Number rows and columns from 1. Row 1 has a star when <code>(row + col) % 4 == 0</code>, row 3 the same. Row 2 is the middle and gets <b>two</b> stars per period: that same rule plus <code>col % 4 == 0</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 1; row <= 3; row++) {              //> The wave is always 3 rows tall.
        for (int col = 1; col <= n; col++) {          //> n columns wide (1-based so the formula is neat).
            if ((row + col) % 4 == 0 || (row == 2 && col % 4 == 0)) { //> A diagonal every 4 columns, plus the extra stars in the middle row.
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-num-diamond', group: 'patterns:J', title: 'Number diamond with the abs() trick', level: 'hard', grid: true, input: '4',
    prompt: '<pre class="console">   1\n  121\n 12321\n1234321\n 12321\n  121\n   1</pre>',
    idea: '<p>Instead of writing two halves, let one loop variable <code>i</code> run from <code>−(n−1)</code> to <code>n−1</code>. Then <code>abs(i)</code> is <b>the distance from the middle row</b>: 3, 2, 1, 0, 1, 2, 3. Spaces are <code>abs(i)</code> and the peak number is <code>n − abs(i)</code>. One loop makes the whole diamond, and the same trick works for any mirrored pattern.</p>',
    formula: [['i', 'abs(i) = spaces', 'peak = n − abs(i)'], ['−3', '3', '1'], ['−1', '1', '3'], ['0', '0', '4'], ['2', '2', '2']],
    code: R`
#include <stdio.h>
#include <stdlib.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = -(n - 1); i <= n - 1; i++) {   //> One loop for all 2n − 1 rows. {i} is negative above the middle, 0 in the middle, positive below.
        int d = abs(i);                         //> Distance from the middle row.
        int peak = n - d;                       //> Biggest number on this row.
        for (int s = 0; s < d; s++) printf(" ");
        for (int k = 1; k <= peak; k++) printf("%d", k);   //> Up: 1 … peak.
        for (int k = peak - 1; k >= 1; k--) printf("%d", k); //> Down: peak−1 … 1.
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-snake-floyd', group: 'patterns:J', title: 'Snake Floyd triangle 1 / 3 2 / 4 5 6 / 10 9 8 7', level: 'hard', grid: true, input: '5',
    prompt: '<p>Floyd’s triangle, but every second row is written backwards.</p>',
    idea: '<p>Combines two ideas. The <b>counter</b>: row r begins at <code>r(r+1)/2 + 1</code> (the numbers used before it are 1 + 2 + … + r). The <b>parity</b>: even rows count up from the start, odd rows count down from the end of the row.</p>',
    formula: [['row', 'first number of row', 'last number of row', 'direction'], ['0', '1', '1', '→'], ['1', '2', '3', '←'], ['row', 'row(row+1)/2 + 1', 'first + row', 'even → , odd ←']],
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        int first = row * (row + 1) / 2 + 1;   //> How many numbers came before this row (0 + 1 + … + row), plus 1.
        int last = first + row;                //> The row has row + 1 numbers.
        for (int k = 0; k <= row; k++) {
            int v = (row % 2 == 0) ? first + k : last - k; //> Even row: count up from {first}. Odd row: count down from {last}.
            printf("%d ", v);
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-alt-rows', group: 'patterns:J', title: 'Rows alternating numbers and stars', level: 'medium', grid: true, input: '5',
    prompt: '<pre class="console">1\n* *\n1 2 3\n* * * *\n1 2 3 4 5</pre>',
    idea: '<p>The <b>shape</b> is the plain triangle. The <b>value</b> depends on the row’s parity: even rows print numbers, odd rows print stars. Putting an <code>if</code> inside the inner loop lets you mix any two patterns.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int row = 0; row < n; row++) {
        for (int col = 0; col <= row; col++) {
            if (row % 2 == 0) {
                printf("%d ", col + 1);   //> Even row → numbers 1 … row+1.
            } else {
                printf("* ");             //> Odd row → stars.
            }
        }
        printf("\n");
    }
    return 0;
}`,
  });

  P({ id: 'pt-spiral', group: 'patterns:J', title: 'Spiral number matrix', level: 'hard', grid: true, input: '4', lc: { n: 59, slug: 'spiral-matrix-ii' },
    prompt: '<p>Fill an n × n grid with 1 … n² going round in a spiral (right, down, left, up, and repeat), then print it.</p>',
    idea: '<p>This one can’t be printed row by row, because row 2 depends on numbers placed at the very end. So <b>fill a 2D array first, then print it</b>. Keep four walls <code>top, bottom, left, right</code>. Walk along the top wall and move it down, walk the right wall and move it in, and so on until the walls cross. Open the visualiser and watch the matrix in the Variables panel fill up.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int a[n][n];                                       //> A 2D array: n rows × n columns. We fill it first and print it at the end.
    int top = 0, bottom = n - 1, left = 0, right = n - 1; //> The four walls of the part that is still empty.
    int num = 1;                                       //> Next number to place.
    while (top <= bottom && left <= right) {           //> Repeat while there is still an empty area.
        for (int c = left; c <= right; c++) a[top][c] = num++;   //> → along the top row, left to right.
        top++;                                         //> That row is full: move the top wall down.
        for (int r = top; r <= bottom; r++) a[r][right] = num++; //> ↓ down the right column.
        right--;
        if (top <= bottom) {                           //> Is there still a row left? (Needed for odd n.)
            for (int c = right; c >= left; c--) a[bottom][c] = num++; //> ← along the bottom row, right to left.
            bottom--;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; r--) a[r][left] = num++;   //> ↑ up the left column.
            left++;
        }
    }
    for (int r = 0; r < n; r++) {                      //> Now print the finished grid row by row.
        for (int c = 0; c < n; c++) printf("%3d", a[r][c]); //> {%3d} pads each number to 3 characters so the columns line up.
        printf("\n");
    }
    return 0;
}`,
    complexity: 'Each cell is filled once and printed once → O(n²) time, O(n²) space for the array.',
    traps: ['Without the two <code>if</code> checks, an odd n overwrites the centre cell twice.'] });
})();
