// Sequences & series: loop problems where each term is built from i or from the previous term.
// watch = variables shown in the Sequence tab (the 2nd one gets the bar), at = the line that finishes a term.
(function () {
  const P = CN.add, R = String.raw;

  // ------------------------------------------------------------ examples used in the notes
  P({ id: 'ex-seq-direct', example: true, title: 'Way 1: compute each term from i', input: '5', watch: ['i', 'term', 'sum'], at: 'sum += term;',
    prompt: '<p>The i-th term of 1² + 2² + 3² + … is just <code>i * i</code>, so each term is computed fresh from <code>i</code>. Open the <b>Sequence</b> tab.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        int term = i * i;          //> The term depends only on {i}: a direct formula.
        sum += term;               //> Add it to the running total.
    }
    printf("sum = %d\n", sum);
    return 0;
}` });

  P({ id: 'ex-seq-carry', example: true, title: 'Way 2: build each term from the previous one', input: '5', watch: ['i', 'term', 'sum'], at: 'sum += term;',
    prompt: '<p>The terms 1, 11, 111, 1111 … have no neat formula in <code>i</code>, but each one is <b>the previous term × 10 + 1</b>. Keep the term in a variable that lives <b>outside</b> the loop and update it.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    long long term = 0, sum = 0;   //> {term} is declared outside the loop, so it remembers the previous term.
    for (int i = 1; i <= n; i++) {
        term = term * 10 + 1;      //> 0 → 1 → 11 → 111: shift left one digit and append a 1.
        sum += term;
    }
    printf("sum = %lld\n", sum);
    return 0;
}` });

  P({ id: 'ex-seq-sign', example: true, title: 'Alternating signs: flip a sign variable', input: '6', watch: ['i', 'sign', 'sum'], at: 'sign = -sign;',
    prompt: '<p>1 − 2 + 3 − 4 + … Keep <code>sign</code> = +1 or −1 and flip it with <code>sign = -sign</code> after every term.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int sum = 0, sign = 1;         //> The first term is added, so start with +1.
    for (int i = 1; i <= n; i++) {
        sum += sign * i;           //> +i or −i depending on the current sign.
        sign = -sign;              //> Flip: +1 → −1 → +1 …
    }
    printf("sum = %d\n", sum);
    return 0;
}` });

  // ------------------------------------------------------------ A. sums & progressions
  P({ id: 'sq-squares', group: 'seq:A', title: 'Sum of squares 1² + 2² + … + n²', level: 'easy', input: '6', watch: ['i', 'sum'], at: 'sum += i * i;',
    prompt: '<p>Find 1² + 2² + … + n² with a loop, and check it against the formula n(n+1)(2n+1)/6.</p>',
    idea: '<p>An accumulator with term <code>i * i</code>. Printing the formula next to the loop result is a good habit: if they disagree, your loop limits are wrong.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    long long sum = 0;                        //> long long: the sum grows like n³.
    for (int i = 1; i <= n; i++) {
        sum += i * i;                         //> Add the i-th term.
    }
    printf("loop    = %lld\n", sum);
    printf("formula = %lld\n", (long long)n * (n + 1) * (2 * n + 1) / 6); //> Cast first so the multiplication is done in long long, not int.
    return 0;
}`,
    complexity: 'Loop O(n), formula O(1).' });

  P({ id: 'sq-odd', group: 'seq:A', title: 'Sum of the first n odd numbers', level: 'easy', input: '6', watch: ['i', 'odd', 'sum'], at: 'sum += odd;',
    prompt: '<p>1 + 3 + 5 + … (n terms). What do you notice about the answer?</p>',
    idea: '<p>The i-th odd number is <code>2i − 1</code>. The sums are 1, 4, 9, 16 …: always <b>n²</b>. Watch the Sequence tab.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int sum = 0;
    for (int i = 1; i <= n; i++) {
        int odd = 2 * i - 1;       //> i-th odd number: 1, 3, 5, …
        sum += odd;
    }
    printf("sum = %d (n*n = %d)\n", sum, n * n);
    return 0;
}` });

  P({ id: 'sq-ap', group: 'seq:A', title: 'Arithmetic progression a, a+d, a+2d …', level: 'easy', input: '3 4 6', watch: ['i', 'term', 'sum'], at: 'term += d;',
    prompt: '<p>Read the first term <code>a</code>, the common difference <code>d</code> and <code>n</code>. Print the n terms and their sum.</p>',
    idea: '<p>An AP is “add the same <code>d</code> every time”, so carry the term: <code>term += d</code>. Check the sum with the formula <code>n/2 · (2a + (n−1)d)</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, d, n;
    scanf("%d %d %d", &a, &d, &n);
    int term = a, sum = 0;         //> Start at the first term.
    for (int i = 1; i <= n; i++) {
        printf("%d ", term);
        sum += term;
        term += d;                 //> The next term is d more.
    }
    printf("\nsum = %d, formula = %d\n", sum, n * (2 * a + (n - 1) * d) / 2);
    return 0;
}` });

  P({ id: 'sq-gp', group: 'seq:A', title: 'Geometric progression a, ar, ar² …', level: 'easy', input: '2 3 6', watch: ['i', 'term', 'sum'], at: 'term *= r;',
    prompt: '<p>Read <code>a</code>, ratio <code>r</code> and <code>n</code>. Print the terms and their sum.</p>',
    idea: '<p>A GP is “multiply by the same <code>r</code> every time”: <code>term *= r</code>. The terms grow very fast, so use <code>long long</code>. Never use <code>pow()</code> for integer powers, because it returns a double and can be off by one.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, r, n;
    scanf("%d %d %d", &a, &r, &n);
    long long term = a, sum = 0;
    for (int i = 1; i <= n; i++) {
        printf("%lld ", term);
        sum += term;
        term *= r;                 //> The next term is r times bigger.
    }
    printf("\nsum = %lld\n", sum);
    return 0;
}`,
    traps: ['<code>(int)pow(5, 2)</code> can give 24 on some compilers, because 25.0 is stored as 24.999… Multiply in a loop instead.'] });

  P({ id: 'sq-bank', group: 'seq:A', title: 'Calculate money in LeetCode bank', level: 'easy', input: '20', lc: { n: 1716, slug: 'calculate-money-in-leetcode-bank' },
    watch: ['day', 'deposit', 'total'], at: 'total += deposit;',
    prompt: '<p>Monday of week 1 you deposit $1, then $1 more each day until Sunday. Every Monday you deposit $1 more than the previous Monday. Total after n days?</p>',
    idea: '<p>Day <code>i</code> (0-based) is in week <code>i / 7</code> and is weekday <code>i % 7</code>. The deposit is <code>week + weekday + 1</code>. Using <code>/</code> and <code>%</code> by 7 is the standard way to split a day count into weeks.</p>',
    code: R`
#include <stdio.h>

int totalMoney(int n) {
    int total = 0;
    for (int day = 0; day < n; day++) {
        int deposit = day / 7 + day % 7 + 1; //> (week number) + (day in week) + 1. Day 0 → $1, day 7 (next Monday) → $2.
        total += deposit;
    }
    return total;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", totalMoney(n));
    return 0;
}` });

  P({ id: 'sq-divsums', group: 'seq:A', title: 'Divisible and non-divisible sums difference', level: 'easy', input: '10 3', lc: { n: 2894, slug: 'divisible-and-non-divisible-sums-difference' },
    watch: ['i', 'num1', 'num2'], at: ['num2 += i;', 'else num1 += i;'],
    prompt: '<p>num1 = sum of 1…n <b>not</b> divisible by m, num2 = sum of those that <b>are</b>. Return num1 − num2.</p>',
    idea: '<p>Two accumulators, and one <code>if</code> picks which one gets each number.</p>',
    code: R`
#include <stdio.h>

int differenceOfSums(int n, int m) {
    int num1 = 0, num2 = 0;
    for (int i = 1; i <= n; i++) {
        if (i % m == 0) num2 += i;    //> Divisible by m → second bucket.
        else num1 += i;               //> Otherwise → first bucket.
    }
    return num1 - num2;
}

int main() {
    int n, m;
    scanf("%d %d", &n, &m);
    printf("%d\n", differenceOfSums(n, m));
    return 0;
}` });

  P({ id: 'sq-coins', group: 'seq:A', title: 'Arranging coins', level: 'easy', input: '12', lc: { n: 441, slug: 'arranging-coins' }, watch: ['rows', 'n'], at: 'n -= rows;',
    prompt: '<p>Build a staircase with n coins: row k needs k coins. How many <b>complete</b> rows can you build?</p>',
    idea: '<p>Subtract 1, 2, 3, … from n while you still have enough for the next row. The loop stops as soon as the next row would need more coins than are left.</p>',
    code: R`
#include <stdio.h>

int arrangeCoins(int n) {
    int rows = 0;
    while (n >= rows + 1) {    //> Enough coins for the next row (which needs rows + 1)?
        rows++;                //> Build it …
        n -= rows;             //> … and pay for it.
    }
    return rows;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", arrangeCoins(n));
    return 0;
}`,
    complexity: 'O(√n): k rows use about k²/2 coins.' });

  P({ id: 'sq-pivot', group: 'seq:A', title: 'Find the pivot integer', level: 'easy', input: '8', lc: { n: 2485, slug: 'find-the-pivot-integer' }, watch: ['x', 'left', 'right'], at: 'int right = total - left + x;',
    prompt: '<p>Find x such that 1 + … + x = x + … + n, or return −1.</p>',
    idea: '<p>Grow a <b>prefix sum</b> <code>left</code>. The right side is <code>total − left + x</code> (x belongs to both sides). Compare them at every x.</p>',
    code: R`
#include <stdio.h>

int pivotInteger(int n) {
    int total = n * (n + 1) / 2;           //> 1 + 2 + … + n.
    int left = 0;
    for (int x = 1; x <= n; x++) {
        left += x;                         //> 1 + … + x.
        int right = total - left + x;      //> x + … + n.
        if (left == right) return x;
    }
    return -1;                             //> No pivot found.
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", pivotInteger(n));
    return 0;
}` });

  // ------------------------------------------------------------ B. alternating & fractional
  P({ id: 'sq-alt', group: 'seq:B', title: '1 − 2 + 3 − 4 + … ± n', level: 'easy', input: '9', watch: ['i', 'sign', 'sum'], at: 'sign = -sign;',
    prompt: '<p>Sum the series with alternating signs.</p>',
    idea: '<p>Use the sign-flip variable from the notes. The pattern of results (1, −1, 2, −2, 3 …) also gives an O(1) formula: odd n → <code>(n+1)/2</code>, even n → <code>−n/2</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int sum = 0, sign = 1;
    for (int i = 1; i <= n; i++) {
        sum += sign * i;
        sign = -sign;                       //> Flip for the next term.
    }
    int formula = (n % 2 == 1) ? (n + 1) / 2 : -n / 2;
    printf("loop = %d, formula = %d\n", sum, formula);
    return 0;
}`,
    tryit: ['Another way: <code>if (i % 2 == 0) sum -= i; else sum += i;</code>'] });

  P({ id: 'sq-harmonic', group: 'seq:B', title: 'Harmonic series 1 + 1/2 + … + 1/n', level: 'easy', input: '6', watch: ['i', 'sum'], at: 'sum += 1.0 / i;',
    prompt: '<p>Print the sum with 6 decimal places.</p>',
    idea: '<p>The famous trap: <code>1 / i</code> is <b>integer division</b> and gives 0 for every i ≥ 2. Write <code>1.0 / i</code> so that one side is a double.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    double sum = 0;                //> Fractions need a double.
    for (int i = 1; i <= n; i++) {
        sum += 1.0 / i;            //> {1.0} is a double, so the division keeps the fraction. {1 / i} would be 0 for i ≥ 2.
    }
    printf("%.6f\n", sum);
    return 0;
}`,
    traps: ['<code>sum += 1 / i;</code> gives 1.000000 for every n.'] });

  P({ id: 'sq-leibniz', group: 'seq:B', title: 'Approximate π: 4(1 − 1/3 + 1/5 − 1/7 + …)', level: 'medium', input: '12', watch: ['k', 'term', 'sum'], at: 'sign = -sign;',
    prompt: '<p>Use the first n terms of the Leibniz series to approximate π.</p>',
    idea: '<p>This combines three tricks: the odd denominator <code>2k + 1</code>, the sign flip, and <code>1.0</code> to force double division. Try n = 12, then 1000: the series gets closer to 3.14159 very slowly.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    double sum = 0;
    int sign = 1;
    for (int k = 0; k < n; k++) {
        double term = 1.0 / (2 * k + 1);  //> 1, 1/3, 1/5, 1/7 …
        sum += sign * term;               //> Add or subtract.
        sign = -sign;
    }
    printf("pi ~ %.6f\n", 4 * sum);
    return 0;
}` });

  P({ id: 'sq-exp', group: 'seq:B', title: 'eˣ = 1 + x + x²/2! + x³/3! + …', level: 'hard', input: '1 10', watch: ['i', 'term', 'sum'], at: 'sum += term;',
    prompt: '<p>Read x and n and compute the first n+1 terms of the eˣ series.</p>',
    idea: '<p>Computing <code>pow(x, i) / factorial(i)</code> for every term is slow and overflows quickly. Look at how a term relates to the one before it: <code>term(i) = term(i−1) × x / i</code>. One multiply and one divide per term, and the numbers stay small. This “carry the term” trick is used for every series with factorials.</p>',
    formula: [['i', 'term', 'from previous'], ['0', '1', '—'], ['1', 'x', '1 × x / 1'], ['2', 'x²/2', 'x × x / 2'], ['i', 'xⁱ/i!', 'prev × x / i']],
    code: R`
#include <stdio.h>

int main() {
    double x;
    int n;
    scanf("%lf %d", &x, &n);
    double term = 1, sum = 1;     //> Term 0 is x⁰/0! = 1, and it is already counted in sum.
    for (int i = 1; i <= n; i++) {
        term = term * x / i;      //> xⁱ/i! from x^(i−1)/(i−1)!: multiply by x, divide by i.
        sum += term;
    }
    printf("e^%.2f ~ %.6f\n", x, sum);
    return 0;
}`,
    tryit: ['For sin x = x − x³/3! + x⁵/5! − …, the ratio between terms is <code>−x² / ((2i)(2i+1))</code>.'] });

  // ------------------------------------------------------------ C. term-building
  P({ id: 'sq-ones', group: 'seq:C', title: '1 + 11 + 111 + … (n terms)', level: 'easy', input: '5', watch: ['i', 'term', 'sum'], at: 'sum += term;',
    prompt: '<p>Print the series and its sum.</p>',
    idea: '<p><code>term = term × 10 + 1</code> appends a 1 to the right of the term. Printing <code>" + "</code> only <i>between</i> terms needs a small <code>if (i &gt; 1)</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    long long term = 0, sum = 0;
    for (int i = 1; i <= n; i++) {
        term = term * 10 + 1;         //> 1 → 11 → 111 …
        if (i > 1) printf(" + ");     //> A separator before every term except the first.
        printf("%lld", term);
        sum += term;
    }
    printf(" = %lld\n", sum);
    return 0;
}` });

  P({ id: 'sq-digit-series', group: 'seq:C', title: 'd + dd + ddd + … (any digit)', level: 'easy', input: '7 4', watch: ['i', 'term', 'sum'], at: 'sum += term;',
    prompt: '<p>Read a digit d and n, e.g. 7 + 77 + 777 + 7777.</p>',
    idea: '<p>The same idea as 1, 11, 111 with the digit as a variable: <code>term = term × 10 + d</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int d, n;
    scanf("%d %d", &d, &n);
    long long term = 0, sum = 0;
    for (int i = 1; i <= n; i++) {
        term = term * 10 + d;         //> Append the digit d.
        sum += term;
    }
    printf("%lld\n", sum);
    return 0;
}` });

  P({ id: 'sq-fact-series', group: 'seq:C', title: '1! + 2! + 3! + … + n!', level: 'easy', input: '6', watch: ['i', 'fact', 'sum'], at: 'sum += fact;',
    prompt: '<p>Sum the factorials from 1! to n!.</p>',
    idea: '<p>Beginners often write a nested loop that recomputes each factorial from scratch (O(n²)). But <code>i! = (i−1)! × i</code>, so carry <code>fact</code> forward and the whole thing is O(n).</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    long long fact = 1, sum = 0;
    for (int i = 1; i <= n; i++) {
        fact *= i;                    //> Turn (i−1)! into i! with one multiplication.
        sum += fact;
    }
    printf("%lld\n", sum);
    return 0;
}`,
    complexity: 'O(n) instead of O(n²).' });

  P({ id: 'sq-gaps', group: 'seq:C', title: '1, 2, 4, 7, 11, 16 … (growing gaps)', level: 'easy', input: '8', watch: ['i', 'term'], at: 'term += i;',
    prompt: '<p>Print the first n terms: each gap is one bigger than the previous gap.</p>',
    idea: '<p>Look at the <b>differences</b>: +1, +2, +3, +4 … So the next term is <code>term + i</code>. Whenever a sequence has no obvious rule, write down the differences between terms.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int term = 1;
    for (int i = 1; i <= n; i++) {
        printf("%d ", term);
        term += i;                    //> The gap grows by one each time.
    }
    printf("\n");
    return 0;
}` });

  // ------------------------------------------------------------ D. recurrences
  P({ id: 'sq-fib-series', group: 'seq:D', title: 'Print the Fibonacci series', level: 'easy', input: '10', watch: ['i', 'a', 'b'], at: 'b = c;',
    prompt: '<p>Print the first n Fibonacci numbers: 0 1 1 2 3 5 …</p>',
    idea: '<p>A <b>recurrence</b>: each term depends on the previous two. Keep the last two in <code>a</code>, <code>b</code> and slide them forward. The Sequence tab shows the pair moving along.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    long long a = 0, b = 1;             //> The first two terms.
    for (int i = 0; i < n; i++) {
        printf("%lld ", a);             //> a is always the current term.
        long long c = a + b;            //> The term after b.
        a = b;                          //> Slide the window one step to the right …
        b = c;
    }
    printf("\n");
    return 0;
}` });

  P({ id: 'sq-trib', group: 'seq:D', title: 'N-th Tribonacci number', level: 'easy', input: '10', lc: { n: 1137, slug: 'n-th-tribonacci-number' }, watch: ['i', 'c', 'b', 'a'], at: 'c = d;',
    prompt: '<p>T0 = 0, T1 = 1, T2 = 1, Tn = Tn−1 + Tn−2 + Tn−3. Return Tn.</p>',
    idea: '<p>Fibonacci with a window of <b>three</b>. The shifting works the same way: compute the new value first, then move every variable one place left.</p>',
    code: R`
#include <stdio.h>

int tribonacci(int n) {
    if (n == 0) return 0;
    if (n <= 2) return 1;
    int a = 0, b = 1, c = 1;             //> T(i−3), T(i−2), T(i−1).
    for (int i = 3; i <= n; i++) {
        int d = a + b + c;               //> T(i).
        a = b;                           //> Shift the window: the oldest value drops out.
        b = c;
        c = d;
    }
    return c;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", tribonacci(n));
    return 0;
}` });

  P({ id: 'sq-stairs', group: 'seq:D', title: 'Climbing stairs', level: 'easy', input: '6', lc: { n: 70, slug: 'climbing-stairs' }, watch: ['i', 'cur', 'prev'], at: 'prev = tmp;',
    prompt: '<p>You can climb 1 or 2 steps at a time. In how many distinct ways can you reach step n?</p>',
    idea: '<p>Think about your <b>last move</b>. To reach step i you came from step i−1 (a 1-step) or from step i−2 (a 2-step). So <code>ways(i) = ways(i−1) + ways(i−2)</code>, which is Fibonacci again. This is the first DP problem you will meet, hidden inside a loop.</p>',
    code: R`
#include <stdio.h>

int climbStairs(int n) {
    int prev = 1, cur = 1;               //> ways(0) = 1 (stand still), ways(1) = 1.
    for (int i = 2; i <= n; i++) {
        int tmp = cur;
        cur = cur + prev;                //> ways(i) = ways(i−1) + ways(i−2).
        prev = tmp;
    }
    return cur;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", climbStairs(n));
    return 0;
}` });

  P({ id: 'sq-tournament', group: 'seq:D', title: 'Count of matches in tournament', level: 'easy', input: '14', lc: { n: 1688, slug: 'count-of-matches-in-tournament' }, watch: ['n', 'matches'], at: 'matches += m;',
    prompt: '<p>With n teams: if n is even, n/2 matches are played and n/2 teams advance. If n is odd, (n−1)/2 matches are played and (n−1)/2 + 1 teams advance. Total matches until one winner?</p>',
    idea: '<p>Simulate round by round with a <code>while</code>. The number of teams follows the sequence 14 → 7 → 4 → 2 → 1. Then notice the shortcut: every match knocks out exactly one team, so the answer is always <code>n − 1</code>.</p>',
    code: R`
#include <stdio.h>

int numberOfMatches(int n) {
    int matches = 0;
    while (n > 1) {                       //> Until one team is left.
        int m = n / 2;                    //> Matches this round (the odd team out gets a bye).
        matches += m;
        n = n - m;                        //> Every match removes one team.
    }
    return matches;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", numberOfMatches(n));
    return 0;
}` });

  P({ id: 'sq-pillow', group: 'seq:D', title: 'Pass the pillow', level: 'easy', input: '4 5', lc: { n: 2582, slug: 'pass-the-pillow' }, watch: ['t', 'pos', 'dir'], at: 'pos += dir;',
    prompt: '<p>n people in a line. Person 1 has the pillow, and every second it moves to the next person. At either end the direction reverses. Who has it after <code>time</code> seconds?</p>',
    idea: '<p>Keep a position and a <b>direction</b> (+1 / −1) and flip the direction when you hit an end. This bouncing sequence (1 2 3 4 3 2 1 2 …) repeats every <code>2(n−1)</code> steps, which gives the O(1) solution in “Try it yourself”.</p>',
    code: R`
#include <stdio.h>

int passThePillow(int n, int time) {
    int pos = 1, dir = 1;                 //> Start at person 1, moving right.
    for (int t = 1; t <= time; t++) {
        pos += dir;                       //> Pass the pillow one person along.
        if (pos == n || pos == 1) dir = -dir; //> Reached an end → turn around.
    }
    return pos;
}

int main() {
    int n, time;
    scanf("%d %d", &n, &time);
    printf("%d\n", passThePillow(n, time));
    return 0;
}`,
    tryit: ['O(1): <code>r = time / (n-1)</code>, <code>k = time % (n-1)</code>. If r is even the answer is <code>1 + k</code>, otherwise <code>n - k</code>.'] });

  // ------------------------------------------------------------ E. process sequences
  P({ id: 'sq-collatz', group: 'seq:E', title: 'Collatz sequence (3n + 1)', level: 'easy', input: '6', watch: ['steps', 'n'], at: 'steps++;',
    prompt: '<p>If n is even halve it, otherwise make it 3n + 1. Print the sequence until it reaches 1 and count the steps.</p>',
    idea: '<p>A sequence where the next term depends on a <b>condition</b> on the current term. Nobody knows how long it will run, so use <code>while</code>. (Nobody has ever proved that it always reaches 1!)</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int steps = 0;
    printf("%d", n);
    while (n != 1) {
        if (n % 2 == 0) n = n / 2;       //> Even → halve.
        else n = 3 * n + 1;              //> Odd → 3n + 1.
        printf(" -> %d", n);
        steps++;
    }
    printf("\nsteps = %d\n", steps);
    return 0;
}`,
    tryit: ['Try 27: it takes 111 steps and climbs as high as 9232 before falling to 1.'] });

  P({ id: 'sq-happy', group: 'seq:E', title: 'Happy number', level: 'easy', input: '19', lc: { n: 202, slug: 'happy-number' }, watch: ['slow', 'fast'], at: 'fast = next(next(fast));',
    prompt: '<p>Replace n by the sum of the squares of its digits, again and again. If it reaches 1, n is happy. If it loops forever, it is not.</p>',
    idea: '<p>The sequence either reaches 1 or falls into a <b>cycle</b>. To detect a cycle without storing anything, use Floyd’s <b>tortoise and hare</b>: <code>slow</code> moves one step and <code>fast</code> two. If there is a cycle, fast catches up with slow. You will see the same trick again for linked-list cycles.</p>',
    code: R`
#include <stdio.h>
#include <stdbool.h>

int next(int n) {                         //> One step of the sequence: sum of squared digits.
    int s = 0;
    while (n > 0) {
        int d = n % 10;
        s += d * d;
        n /= 10;
    }
    return s;
}

bool isHappy(int n) {
    int slow = n, fast = next(n);
    while (fast != 1 && slow != fast) {   //> Stop at 1 (happy) or when they meet (a cycle).
        slow = next(slow);                //> Tortoise: one step.
        fast = next(next(fast));          //> Hare: two steps.
    }
    return fast == 1;
}

int main() {
    int n;
    scanf("%d", &n);
    printf(isHappy(n) ? "true\n" : "false\n");
    return 0;
}`,
    tryit: ['Run it with 2: the hare and the tortoise meet inside the cycle 4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4.'] });

  P({ id: 'sq-ugly', group: 'seq:E', title: 'Ugly number', level: 'easy', input: '30', lc: { n: 263, slug: 'ugly-number' }, watch: ['n'], at: 'n /= p;',
    prompt: '<p>An ugly number has no prime factors other than 2, 3 and 5. Is n ugly?</p>',
    idea: '<p>Divide out every 2, then every 3, then every 5. If what is left is 1, there were no other factors. The inner <code>while</code> keeps dividing by the same factor as long as it fits.</p>',
    code: R`
#include <stdio.h>
#include <stdbool.h>

bool isUgly(int n) {
    if (n <= 0) return false;
    for (int p = 2; p <= 5; p++) {        //> Try 2, 3, 4, 5. (4 never divides here, because all the 2s are already gone.)
        while (n % p == 0) {
            n /= p;                       //> Remove one factor p.
        }
    }
    return n == 1;
}

int main() {
    int n;
    scanf("%d", &n);
    printf(isUgly(n) ? "true\n" : "false\n");
    return 0;
}` });

  P({ id: 'sq-perfect', group: 'seq:E', title: 'Perfect number', level: 'easy', input: '28', lc: { n: 507, slug: 'perfect-number' }, watch: ['i', 'sum'], at: 'sum += i;',
    prompt: '<p>A perfect number equals the sum of its divisors excluding itself (28 = 1 + 2 + 4 + 7 + 14).</p>',
    idea: '<p>The divisor-pair trick from the loops page: loop <code>i</code> to √num and add both <code>i</code> and <code>num / i</code>. Start the sum at 1 (always a divisor) and the loop at 2, so <code>num</code> itself is never added.</p>',
    code: R`
#include <stdio.h>
#include <stdbool.h>

bool checkPerfectNumber(int num) {
    if (num <= 1) return false;
    int sum = 1;                          //> 1 divides everything (and the partner of 1 is num itself, which we skip).
    for (int i = 2; i * i <= num; i++) {
        if (num % i == 0) {
            sum += i;
            if (i != num / i) sum += num / i; //> The partner divisor, unless it is the same number.
        }
    }
    return sum == num;
}

int main() {
    int n;
    scanf("%d", &n);
    printf(checkPerfectNumber(n) ? "true\n" : "false\n");
    return 0;
}`,
    complexity: 'O(√n).' });
})();
