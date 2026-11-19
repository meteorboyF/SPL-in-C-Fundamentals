// Conditionals: if / else / else-if / nested / switch / ternary problems.
// Every item shows the Decisions tab; `tests` are extra inputs that take other branches.
(function () {
  const R = String.raw;
  const P = d => CN.add(Object.assign({ decisions: true }, d));

  // ------------------------------------------------------------ examples for the notes
  P({ id: 'ex-c-if', example: true, title: 'if without else: an optional step', input: '1200', tests: ['800'],
    prompt: '<p>A shop gives 10% off orders of 1000 or more. With no <code>else</code>, the block either runs or is skipped, and then the program carries on either way.</p>',
    code: R`
#include <stdio.h>

int main() {
    int price;
    scanf("%d", &price);
    if (price >= 1000) {              //> Only big orders get the discount.
        price = price - price / 10;   //> 10% off.
        printf("discount applied\n");
    }
    printf("pay %d\n", price);        //> Runs in both cases: it is after the if.
    return 0;
}` });

  P({ id: 'ex-c-order', example: true, title: 'Order matters in an else-if ladder', input: '35', tests: ['15', '5'],
    prompt: '<p>Both ladders try to label a temperature. The first checks the <b>wide</b> condition first, so 35 is caught by <code>t &gt;= 10</code> and never reaches “hot”. Open the <b>Decisions</b> tab and compare the two.</p>',
    code: R`
#include <stdio.h>

int main() {
    int t;
    scanf("%d", &t);
    if (t >= 10) printf("wrong: warm\n");      //> ✗ The widest test comes first and swallows every t ≥ 10, including 35.
    else if (t >= 30) printf("wrong: hot\n");  //> Can never be reached: any t ≥ 30 was already caught above.
    else printf("wrong: cold\n");
    if (t >= 30) printf("right: hot\n");       //> ✓ Most specific (narrowest) range first …
    else if (t >= 10) printf("right: warm\n"); //> … here we already know t < 30.
    else printf("right: cold\n");
    return 0;
}` });

  P({ id: 'ex-c-short', example: true, title: 'Short-circuit: && stops at the first false', input: '10 0', tests: ['10 2'],
    prompt: '<p>With <code>b = 0</code>, the expression <code>a / b</code> would crash. Because <code>&amp;&amp;</code> stops as soon as one side is false, putting <code>b != 0</code> <b>first</b> guards the division.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    if (b != 0 && a / b > 2) {        //> If {b != 0} is false, C never evaluates {a / b}, so there is no division by zero.
        printf("a is more than twice b\n");
    } else {
        printf("b is zero or a/b <= 2\n");
    }
    return 0;
}` });

  P({ id: 'ex-c-dangling', example: true, title: 'The dangling else', input: '-5', tests: ['5', '20'],
    prompt: '<p>The indentation suggests the <code>else</code> belongs to the first <code>if</code>. It doesn’t: an <code>else</code> always attaches to the <b>nearest</b> unmatched <code>if</code>. Run it with −5: nothing is printed!</p>',
    code: R`
#include <stdio.h>

int main() {
    int x;
    scanf("%d", &x);
    if (x > 0)
        if (x > 10)
            printf("big positive\n");
    else                                  //> Looks like it pairs with {if (x > 0)}, but it pairs with {if (x > 10)}.
        printf("not positive?\n");        //> Runs for 1 … 10, never for negative numbers.
    printf("done\n");
    return 0;
}`,
    tryit: ['Fix it by putting braces <code>{ }</code> around the inner if. Always use braces when you nest.'] });

  P({ id: 'ex-c-ternary', example: true, decisions: false, title: 'Ternary operator: an if-else that gives a value', input: '4 9 7',
    code: R`
#include <stdio.h>

int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    int big = (a > b) ? a : b;            //> {cond ? x : y} is x if cond is true, otherwise y.
    big = (c > big) ? c : big;            //> Bring the third number in.
    printf("max = %d\n", big);
    printf("%d is %s\n", big, big % 2 == 0 ? "even" : "odd"); //> The ternary can pick a string inside printf too.
    return 0;
}` });

  // ------------------------------------------------------------ A. basic if / else
  P({ id: 'cd-sign', group: 'cond:A', title: 'Positive, negative or zero', level: 'easy', input: '7', tests: ['-7', '0'], gfg: 'https://www.geeksforgeeks.org/problems/positive-negative-or-zero/1',
    prompt: '<p>Print whether n is positive, negative or zero.</p>',
    idea: '<p>Three cases means two tests: an else-if ladder. The last case needs no test, because the <code>else</code> is “whatever is left”.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    if (n > 0) {
        printf("positive\n");
    } else if (n < 0) {           //> Reached only if n > 0 was false.
        printf("negative\n");
    } else {                      //> Not > 0 and not < 0 → it must be 0. No test needed.
        printf("zero\n");
    }
    return 0;
}` });

  P({ id: 'cd-abs', group: 'cond:A', title: 'Absolute value without abs()', level: 'easy', input: '-15', tests: ['15', '0'],
    prompt: '<p>Print |n| using only an if.</p>',
    idea: '<p>Only negative numbers need changing, so an <code>if</code> with <b>no else</b> is enough.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    if (n < 0) {
        n = -n;                   //> Flip the sign of negative numbers only.
    }
    printf("%d\n", n);
    return 0;
}` });

  P({ id: 'cd-div35', group: 'cond:A', title: 'Divisible by 3, by 5, by both, or neither', level: 'easy', input: '15', tests: ['9', '10', '7'],
    prompt: '<p>Say which of 3 and 5 divide n.</p>',
    idea: '<p>Four outcomes from two yes/no facts. Save each fact in a variable first, then the ladder reads like English. Check “both” <b>first</b>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int by3 = (n % 3 == 0);       //> 1 if divisible by 3, else 0.
    int by5 = (n % 5 == 0);
    if (by3 && by5) printf("divisible by both\n");   //> The most specific case first.
    else if (by3) printf("divisible by 3 only\n");
    else if (by5) printf("divisible by 5 only\n");
    else printf("divisible by neither\n");
    return 0;
}` });

  P({ id: 'cd-chartype', group: 'cond:A', title: 'Character type: upper, lower, digit or symbol', level: 'easy', input: 'G', tests: ['g', '7', '#'], gfg: 'https://www.geeksforgeeks.org/problems/c-character-types/1',
    prompt: '<p>Read one character and classify it.</p>',
    idea: '<p>Letters and digits are <b>consecutive</b> in ASCII (\'A\'…\'Z\' = 65…90, \'0\'…\'9\' = 48…57), so “is it a capital letter?” is a range check: <code>ch &gt;= \'A\' &amp;&amp; ch &lt;= \'Z\'</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    char ch;
    scanf(" %c", &ch);
    if (ch >= 'A' && ch <= 'Z') {          //> Inside the range of capital letters.
        printf("uppercase letter\n");
    } else if (ch >= 'a' && ch <= 'z') {
        printf("lowercase letter\n");
    } else if (ch >= '0' && ch <= '9') {   //> The digit characters '0'…'9' (48…57), not the numbers 0…9.
        printf("digit\n");
    } else {
        printf("special character\n");
    }
    return 0;
}` });

  P({ id: 'cd-quadrant', group: 'cond:A', title: 'Quadrant of a point', level: 'easy', input: '3 -4', tests: ['-2 5', '-1 -1', '2 2', '0 3', '0 0'],
    prompt: '<p>Given (x, y), print its quadrant, or say it lies on an axis / at the origin.</p>',
    idea: '<p>Handle the <b>special cases first</b> (origin, then the axes). After that, x and y are both non-zero and their signs pick the quadrant.</p>',
    code: R`
#include <stdio.h>

int main() {
    int x, y;
    scanf("%d %d", &x, &y);
    if (x == 0 && y == 0) printf("origin\n");       //> The most special case first.
    else if (x == 0) printf("on the y-axis\n");
    else if (y == 0) printf("on the x-axis\n");
    else if (x > 0 && y > 0) printf("quadrant I\n"); //> From here on, neither coordinate is 0.
    else if (x < 0 && y > 0) printf("quadrant II\n");
    else if (x < 0 && y < 0) printf("quadrant III\n");
    else printf("quadrant IV\n");                    //> The only case left: x > 0, y < 0.
    return 0;
}` });

  P({ id: 'cd-profit', group: 'cond:A', title: 'Profit or loss', level: 'easy', input: '500 650', tests: ['500 420', '300 300'],
    prompt: '<p>Given cost price and selling price, print the profit or loss and its percentage.</p>',
    idea: '<p>Compare, then compute inside each branch. The percentage needs a <code>double</code> division.</p>',
    code: R`
#include <stdio.h>

int main() {
    int cp, sp;
    scanf("%d %d", &cp, &sp);
    if (sp > cp) {
        int p = sp - cp;
        printf("profit %d (%.2f%%)\n", p, p * 100.0 / cp);   //> {100.0} makes it a double division. {%%} prints a % sign.
    } else if (sp < cp) {
        int l = cp - sp;
        printf("loss %d (%.2f%%)\n", l, l * 100.0 / cp);
    } else {
        printf("no profit, no loss\n");
    }
    return 0;
}` });

  // ------------------------------------------------------------ B. ladders & ranges
  P({ id: 'cd-triangle', group: 'cond:B', title: 'Is it a triangle? Which type?', level: 'easy', input: '5 5 8', tests: ['3 4 5', '7 7 7', '1 2 5'],
    prompt: '<p>Given three sides, decide if they form a triangle, and if so whether it is equilateral, isosceles or scalene.</p>',
    idea: '<p><b>Validate first, then classify.</b> Three sides form a triangle only if each pair sums to more than the third side. Only valid triangles are classified, so the classification goes inside the else.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    if (a + b <= c || a + c <= b || b + c <= a) {  //> If any two sides are too short to reach the third → not a triangle.
        printf("not a triangle\n");
    } else {
        if (a == b && b == c) printf("equilateral\n");          //> All three equal.
        else if (a == b || b == c || a == c) printf("isosceles\n"); //> Exactly two equal (all three was handled above).
        else printf("scalene\n");
    }
    return 0;
}`,
    traps: ['<code>a == b == c</code> does not test that three values are equal. It compares <code>(a == b)</code>, which is 0 or 1, with c.'] });

  P({ id: 'cd-electricity', group: 'cond:B', title: 'Electricity bill with slabs', level: 'medium', input: '250', tests: ['80', '150', '420'],
    prompt: '<p>The first 100 units cost 5 each, units 101–200 cost 7, units 201–300 cost 10, and above 300 cost 12. Compute the bill.</p>',
    idea: '<p>Slabs are <b>cumulative</b>: 250 units are 100 at 5, then 100 at 7, then 50 at 10. Each branch adds the <b>full cost of all lower slabs</b> (a constant) plus the units inside its own slab.</p>',
    formula: [['units', 'bill'], ['≤ 100', 'u × 5'], ['101–200', '500 + (u − 100) × 7'], ['201–300', '1200 + (u − 200) × 10'], ['> 300', '2200 + (u − 300) × 12']],
    code: R`
#include <stdio.h>

int main() {
    int u;
    scanf("%d", &u);
    int bill;
    if (u <= 100) {
        bill = u * 5;
    } else if (u <= 200) {                 //> Here we know u > 100.
        bill = 100 * 5 + (u - 100) * 7;    //> The whole first slab, plus the part inside this slab.
    } else if (u <= 300) {
        bill = 100 * 5 + 100 * 7 + (u - 200) * 10;
    } else {
        bill = 100 * 5 + 100 * 7 + 100 * 10 + (u - 300) * 12;
    }
    printf("bill = %d\n", bill);
    return 0;
}`,
    traps: ['Charging every unit at the top rate (<code>u * 10</code> for 250 units) is the classic wrong answer.'] });

  P({ id: 'cd-bmi', group: 'cond:B', title: 'BMI category', level: 'easy', input: '70 1.75', tests: ['50 1.8', '85 1.75', '120 1.75'],
    prompt: '<p>BMI = weight / height². Under 18.5 is underweight, under 25 normal, under 30 overweight, otherwise obese.</p>',
    idea: '<p>Ranges with <code>double</code> boundaries. Going from low to high, each test only needs the <b>upper</b> limit, because the lower limit is guaranteed by the earlier tests failing.</p>',
    code: R`
#include <stdio.h>

int main() {
    double w, h;
    scanf("%lf %lf", &w, &h);
    double bmi = w / (h * h);
    printf("BMI = %.1f -> ", bmi);
    if (bmi < 18.5) printf("underweight\n");
    else if (bmi < 25) printf("normal\n");      //> We already know bmi ≥ 18.5 here.
    else if (bmi < 30) printf("overweight\n");
    else printf("obese\n");
    return 0;
}` });

  P({ id: 'cd-quadratic', group: 'cond:B', title: 'Roots of a quadratic equation', level: 'medium', input: '1 -3 2', tests: ['1 2 1', '1 2 5'],
    prompt: '<p>Solve ax² + bx + c = 0 for a ≠ 0. Print the real roots, or the complex ones.</p>',
    idea: '<p>The <b>discriminant</b> D = b² − 4ac decides the case: D &gt; 0 gives two real roots, D = 0 one repeated root, D &lt; 0 two complex roots (−b/2a ± i·√(−D)/2a).</p>',
    code: R`
#include <stdio.h>
#include <math.h>

int main() {
    double a, b, c;
    scanf("%lf %lf %lf", &a, &b, &c);
    double d = b * b - 4 * a * c;          //> The discriminant.
    if (d > 0) {
        double r1 = (-b + sqrt(d)) / (2 * a);
        double r2 = (-b - sqrt(d)) / (2 * a);
        printf("two real roots: %.2f and %.2f\n", r1, r2);
    } else if (d == 0) {
        printf("one repeated root: %.2f\n", -b / (2 * a));
    } else {
        double re = -b / (2 * a), im = sqrt(-d) / (2 * a); //> √(−d) is real because d is negative here.
        printf("complex roots: %.2f + %.2fi and %.2f - %.2fi\n", re, im, re, im);
    }
    return 0;
}`,
    traps: ['<code>(-b + sqrt(d)) / 2 * a</code> divides by 2 and then <i>multiplies</i> by a. You need the brackets: <code>/ (2 * a)</code>.'] });

  P({ id: 'cd-days', group: 'cond:B', title: 'Days in a month (switch + leap year)', level: 'medium', input: '2 2024', tests: ['2 1900', '4 2023', '12 2023', '13 2023'],
    prompt: '<p>Given month and year, print the number of days.</p>',
    idea: '<p>Months with the same answer <b>share a body</b> through switch fall-through. February needs a nested leap-year test, and invalid months go to <code>default</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int m, y;
    scanf("%d %d", &m, &y);
    int days;
    switch (m) {
        case 1: case 3: case 5: case 7: case 8: case 10: case 12:
            days = 31; break;                     //> All 31-day months share this one line.
        case 4: case 6: case 9: case 11:
            days = 30; break;
        case 2:
            if ((y % 4 == 0 && y % 100 != 0) || y % 400 == 0) days = 29; //> Leap year rule, inside a case.
            else days = 28;
            break;
        default:
            days = -1;                            //> Not a month.
    }
    if (days == -1) printf("invalid month\n");
    else printf("%d days\n", days);
    return 0;
}` });

  P({ id: 'cd-second', group: 'cond:B', title: 'Second largest of three (with ties)', level: 'medium', input: '7 3 9', tests: ['5 5 2', '4 4 4', '1 8 8'],
    prompt: '<p>Print the second largest <b>distinct</b> value of a, b, c, or say there is none.</p>',
    idea: '<p>Find the largest first. The second largest is then the biggest value that is <b>strictly smaller</b> than it. Start <code>second</code> at a marker meaning “none yet” and only accept values below the largest.</p>',
    code: R`
#include <stdio.h>
#include <limits.h>

int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    int big = a;
    if (b > big) big = b;
    if (c > big) big = c;
    int second = INT_MIN;                       //> “No second value yet”.
    if (a < big && a > second) second = a;      //> Only values strictly below the largest count.
    if (b < big && b > second) second = b;
    if (c < big && c > second) second = c;
    if (second == INT_MIN) printf("no second largest\n"); //> All three were equal.
    else printf("second largest = %d\n", second);
    return 0;
}`,
    tryit: ['The same idea, over an array, is the first problem of the Arrays chapter.'] });

  // ------------------------------------------------------------ C. nested & combined logic
  P({ id: 'cd-max3-nested', group: 'cond:C', title: 'Largest of three with nested ifs', level: 'easy', input: '4 9 2', tests: ['9 4 2', '2 4 9', '5 5 5'],
    prompt: '<p>Find the largest using nested if-else (no &amp;&amp;). Then compare with the flat version.</p>',
    idea: '<p>A nested if is a <b>decision tree</b>: first compare a and b, and the winner is compared with c. Every input path does exactly 2 comparisons. Use the Decisions tab with each test input to see the different paths.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    int big;
    if (a >= b) {                 //> Level 1: a or b?
        if (a >= c) big = a;      //> Level 2: the winner (a) against c.
        else big = c;
    } else {
        if (b >= c) big = b;      //> Level 2: the winner (b) against c.
        else big = c;
    }
    printf("%d\n", big);
    return 0;
}` });

  P({ id: 'cd-sort3', group: 'cond:C', title: 'Sort three numbers with only if + swap', level: 'medium', input: '9 2 5', tests: ['1 2 3', '3 2 1', '4 4 1'],
    prompt: '<p>Print a, b, c in increasing order using only comparisons and swaps.</p>',
    idea: '<p>Three compare-and-swap steps sort three values: (a, b), then (b, c), which pushes the largest to c, then (a, b) again. This is bubble sort with the loops unrolled.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, b, c, t;
    scanf("%d %d %d", &a, &b, &c);
    if (a > b) { t = a; a = b; b = t; }   //> Put the smaller of a, b first.
    if (b > c) { t = b; b = c; c = t; }   //> Now c holds the largest of all three.
    if (a > b) { t = a; a = b; b = t; }   //> Fix the first two once more.
    printf("%d %d %d\n", a, b, c);
    return 0;
}` });

  P({ id: 'cd-date', group: 'cond:C', title: 'Is the date valid?', level: 'medium', input: '29 2 2023', tests: ['29 2 2024', '31 4 2023', '15 13 2023', '31 12 2023'],
    prompt: '<p>Given d m y, print whether it is a real calendar date.</p>',
    idea: '<p>Check the <b>cheap, outer</b> conditions first (month 1–12, day ≥ 1). Only then work out how many days this month has, which needs the leap-year rule for February.</p>',
    code: R`
#include <stdio.h>

int main() {
    int d, m, y;
    scanf("%d %d %d", &d, &m, &y);
    int valid = 1;
    if (m < 1 || m > 12 || d < 1) {
        valid = 0;                              //> Impossible month or day.
    } else {
        int maxd = 31;
        if (m == 4 || m == 6 || m == 9 || m == 11) maxd = 30;
        else if (m == 2) {
            int leap = (y % 4 == 0 && y % 100 != 0) || y % 400 == 0;
            maxd = leap ? 29 : 28;
        }
        if (d > maxd) valid = 0;                //> Day too large for this month.
    }
    printf(valid ? "valid\n" : "invalid\n");
    return 0;
}` });

  P({ id: 'cd-rps', group: 'cond:C', title: 'Rock, paper, scissors', level: 'easy', input: 'R S', tests: ['P R', 'S S', 'S R'],
    prompt: '<p>Two players type R, P or S. Who wins?</p>',
    idea: '<p>Handle the <b>draw</b> first. Then list the three ways player 1 can win, and anything else means player 2 wins. Listing the winning pairs is much shorter than writing all 9 combinations.</p>',
    code: R`
#include <stdio.h>

int main() {
    char p1, p2;
    scanf(" %c %c", &p1, &p2);
    if (p1 == p2) {
        printf("draw\n");
    } else if ((p1 == 'R' && p2 == 'S') ||   //> Rock crushes scissors,
               (p1 == 'S' && p2 == 'P') ||   //> scissors cut paper,
               (p1 == 'P' && p2 == 'R')) {   //> paper covers rock.
        printf("player 1 wins\n");
    } else {
        printf("player 2 wins\n");           //> Not a draw and not a player-1 win.
    }
    return 0;
}` });

  P({ id: 'cd-time', group: 'cond:C', title: 'Which time is earlier?', level: 'easy', input: '9 45 10 5', tests: ['10 5 9 45', '8 30 8 10', '8 0 8 0'],
    prompt: '<p>Compare two times h1:m1 and h2:m2.</p>',
    idea: '<p>Compare like a dictionary: the <b>hours decide</b>, and only if they are equal do the minutes decide. (Or convert both to minutes: <code>h * 60 + m</code>.)</p>',
    code: R`
#include <stdio.h>

int main() {
    int h1, m1, h2, m2;
    scanf("%d %d %d %d", &h1, &m1, &h2, &m2);
    if (h1 != h2) {                            //> Different hours → the hours alone decide.
        if (h1 < h2) printf("first is earlier\n");
        else printf("second is earlier\n");
    } else if (m1 != m2) {                     //> Same hour → compare minutes.
        if (m1 < m2) printf("first is earlier\n");
        else printf("second is earlier\n");
    } else {
        printf("same time\n");
    }
    return 0;
}` });

  // ------------------------------------------------------------ D. LeetCode
  P({ id: 'cd-kitems', group: 'cond:D', title: 'K items with the maximum sum', level: 'easy', input: '3 2 0 4', tests: ['3 2 0 2', '3 2 3 8'], lc: { n: 2600, slug: 'k-items-with-the-maximum-sum' },
    prompt: '<p>A bag has numOnes 1s, numZeros 0s and numNegOnes −1s. Pick exactly k items to maximise the sum.</p>',
    idea: '<p>Greedy order: take 1s first, then 0s, then −1s only if forced. Which case you are in depends on how big k is, so it becomes an if-else ladder over k.</p>',
    code: R`
#include <stdio.h>

int kItemsWithMaximumSum(int ones, int zeros, int negs, int k) {
    if (k <= ones) return k;                  //> Enough 1s to fill the whole pick.
    if (k <= ones + zeros) return ones;       //> All the 1s, padded with 0s.
    return ones - (k - ones - zeros);         //> Forced to take some −1s.
}

int main() {
    int a, b, c, k;
    scanf("%d %d %d %d", &a, &b, &c, &k);
    printf("%d\n", kItemsWithMaximumSum(a, b, c, k));
    return 0;
}`,
    complexity: 'O(1).' });

  P({ id: 'cd-box', group: 'cond:D', title: 'Categorize box according to criteria', level: 'easy', input: '1000 35 700 300', tests: ['200 50 800 50', '10000 1 1 1', '10000 1 1 200'], lc: { n: 2525, slug: 'categorize-box-according-to-criteria' },
    prompt: '<p>A box is <b>Bulky</b> if any side is ≥ 10⁴ or its volume is ≥ 10⁹. It is <b>Heavy</b> if its mass is ≥ 100. Output "Both", "Bulky", "Heavy" or "Neither".</p>',
    idea: '<p>Compute the two yes/no facts first, then a 4-way ladder with “both” first. The volume can reach 10¹², so use <code>long long</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    long long l, w, h;
    int mass;
    scanf("%lld %lld %lld %d", &l, &w, &h, &mass);
    int bulky = (l >= 10000 || w >= 10000 || h >= 10000 || l * w * h >= 1000000000LL); //> long long, because 10⁴ × 10⁴ × 10⁴ does not fit in an int.
    int heavy = (mass >= 100);
    if (bulky && heavy) printf("Both\n");
    else if (bulky) printf("Bulky\n");
    else if (heavy) printf("Heavy\n");
    else printf("Neither\n");
    return 0;
}` });

  P({ id: 'cd-chess', group: 'cond:D', title: 'Same colour chessboard squares?', level: 'easy', input: 'a1 c3', tests: ['a1 h3', 'd4 e5'], lc: { n: 3274, slug: 'check-if-two-chessboard-squares-have-the-same-color' },
    prompt: '<p>Given two squares like "a1" and "c3", do they have the same colour?</p>',
    idea: '<p>A square’s colour is the parity of <code>column + row</code>, the checkerboard idea from the patterns page. A column letter becomes a number with <code>col − \'a\'</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    char c1, c2;
    int r1, r2;
    scanf(" %c%d %c%d", &c1, &r1, &c2, &r2);   //> {%c%d} reads "a1" as the letter a and the number 1.
    int color1 = (c1 - 'a' + r1) % 2;          //> 'a' → 0, 'b' → 1 … plus the row, mod 2.
    int color2 = (c2 - 'a' + r2) % 2;
    if (color1 == color2) printf("true\n");
    else printf("false\n");
    return 0;
}` });

  P({ id: 'cd-delay', group: 'cond:D', title: 'Calculate delayed arrival time', level: 'easy', input: '15 5', tests: ['13 11', '23 1'], lc: { n: 2651, slug: 'calculate-delayed-arrival-time' },
    prompt: '<p>A train arrives at hour <code>a</code> (0–23) and is <code>d</code> hours late. At what hour does it arrive?</p>',
    idea: '<p>Clock arithmetic wraps around at 24. The <code>if</code> version subtracts 24 when it overflows, and <code>% 24</code> does the same in one step.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, d;
    scanf("%d %d", &a, &d);
    int t = a + d;
    if (t >= 24) t -= 24;              //> Past midnight → wrap around.
    printf("%d (same as %d)\n", t, (a + d) % 24); //> The modulo version gives the same answer.
    return 0;
}` });

  P({ id: 'cd-odds', group: 'cond:D', title: 'Count odd numbers in an interval range', level: 'easy', input: '3 7', tests: ['8 10', '4 4', '0 0'], lc: { n: 1523, slug: 'count-odd-numbers-in-an-interval-range' },
    prompt: '<p>How many odd numbers are there between low and high, inclusive? (Up to 10⁹, so no loop.)</p>',
    idea: '<p>Every pair of consecutive numbers has exactly one odd. The count is about <code>(high − low) / 2</code>, plus one more if <b>either end</b> is odd. That “either end” is the conditional part.</p>',
    code: R`
#include <stdio.h>

int countOdds(int low, int high) {
    int count = (high - low) / 2;
    if (low % 2 == 1 || high % 2 == 1) count++;   //> An odd endpoint adds one more odd number.
    return count;
}

int main() {
    int low, high;
    scanf("%d %d", &low, &high);
    printf("%d\n", countOdds(low, high));
    return 0;
}`,
    complexity: 'O(1), where a loop would be O(high − low).' });

  P({ id: 'cd-board', group: 'cond:D', title: 'Count distinct numbers on board', level: 'easy', input: '5', tests: ['1', '2'], lc: { n: 2549, slug: 'count-distinct-numbers-on-board' },
    prompt: '<p>Start with n on a board. Each day, for every x on the board, add every i in 1…n with x % i == 1. How many distinct numbers after 10⁹ days?</p>',
    idea: '<p>A “thinking” problem: x % (x − 1) == 1 for x &gt; 2, so n adds n−1, which adds n−2, … down to 2. Everything from 2 to n appears, giving <code>n − 1</code> numbers. The only exception is n = 1, where nothing is added. The whole solution is one condition.</p>',
    code: R`
#include <stdio.h>

int distinctIntegers(int n) {
    if (n == 1) return 1;     //> Special case: the board stays {1}.
    return n - 1;             //> 2, 3, …, n all appear.
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", distinctIntegers(n));
    return 0;
}` });
})();
