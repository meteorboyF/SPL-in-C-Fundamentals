// Loops & nested loops: worked examples for the notes + problems.
(function () {
  const P = CN.add, R = String.raw;

  // ------------------------------------------------------------ examples used inside the notes
  P({ id: 'ex-for', example: true, title: 'A for loop, step by step', input: '4',
    prompt: '<p>Press <b>Step ▶</b> and look at the order in which the parts of the <code>for</code> line run: <b>init</b> once, then <b>check → body → update</b> again and again.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {  //> init {i = 1} runs once → check {i <= n} → body → update {i++} → check → …
        printf("%d ", i);           //> The body: runs only when the check was true.
    }
    printf("\nDone, i is gone now\n"); //> {i} was declared inside the {for}, so it no longer exists here.
    return 0;
}` });

  P({ id: 'ex-while', example: true, title: 'A while loop: peel off the digits', input: '4721',
    prompt: '<p><code>n % 10</code> gives the last digit and <code>n / 10</code> removes it. This digit-peeling idea is used in many LeetCode problems.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    while (n > 0) {                  //> Keep going while there are digits left. We don’t know in advance how many times this runs, which is why {while} fits better than {for}.
        int digit = n % 10;          //> Last digit: the remainder when divided by 10.
        printf("digit %d\n", digit);
        n = n / 10;                  //> Integer division throws the last digit away: 4721 → 472.
    }
    return 0;
}` });

  P({ id: 'ex-dowhile', example: true, title: 'do-while runs the body at least once', input: '0',
    prompt: '<p>Counting digits with <code>while (n &gt; 0)</code> would say 0 has <b>0</b> digits. A <code>do-while</code> runs the body before checking, so 0 correctly has 1 digit.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int count = 0;
    do {
        count++;                     //> This runs at least once, even when n is 0.
        n = n / 10;
    } while (n > 0);                 //> The check happens <b>after</b> the body. Note the semicolon.
    printf("%d digit(s)\n", count);
    return 0;
}` });

  P({ id: 'ex-break', example: true, title: 'break and continue', input: '10',
    prompt: '<p><code>continue</code> skips the rest of the current iteration. <code>break</code> leaves the whole loop.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        if (i % 2 == 0) {
            continue;                //> Even number → skip the printf below and go straight to {i++}.
        }
        if (i > 7) {
            break;                   //> Past 7 → stop the loop completely. The remaining iterations never happen.
        }
        printf("%d ", i);
    }
    printf("\n");
    return 0;
}` });

  P({ id: 'ex-nested', example: true, title: 'How a nested loop runs', input: '3', grid: false,
    prompt: '<p>Open the <b>Trace table</b> tab. For every <b>one</b> value of <code>i</code>, <code>j</code> runs through <b>all</b> its values, like the hour and minute hands of a clock.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {       //> Outer loop: the slow hand.
        for (int j = 1; j <= n; j++) {   //> Inner loop: the fast hand. It starts again from 1 every time {i} changes.
            printf("(%d,%d) ", i, j);    //> Runs n × n times in total.
        }
        printf("\n");                    //> Runs n times: once after each full inner loop.
    }
    return 0;
}` });

  // ------------------------------------------------------------ problems: basic loops
  P({ id: 'lp-sum', group: 'loops:A', title: 'Sum of the first n natural numbers', level: 'easy', input: '10', gfg: 'https://www.geeksforgeeks.org/problems/sum-of-first-n-terms5843/1',
    prompt: '<p>Find 1 + 2 + … + n.</p>',
    idea: '<p>The <b>accumulator pattern</b>: start a variable at 0 (the “empty” sum) and add each <code>i</code> to it. The formula <code>n(n+1)/2</code> gives the same answer in O(1), and we print both to compare.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int sum = 0;                       //> Accumulator: starts at 0, the sum of nothing.
    for (int i = 1; i <= n; i++) {
        sum += i;                      //> Add the current number. {sum += i} is short for {sum = sum + i}.
    }
    printf("loop:    %d\n", sum);
    printf("formula: %d\n", n * (n + 1) / 2); //> Gauss’s formula, O(1) instead of O(n).
    return 0;
}`,
    complexity: 'Loop O(n). Formula O(1).',
    traps: ['Forgetting <code>sum = 0</code>: a local variable starts with garbage.'] });

  P({ id: 'lp-fact', group: 'loops:A', title: 'Factorial', level: 'easy', input: '10', gfg: 'https://www.geeksforgeeks.org/problems/factorial5739/1',
    prompt: '<p>n! = 1 × 2 × … × n.</p>',
    idea: '<p>A multiplying accumulator starts at <b>1</b>, not 0. Factorials grow fast: 13! is already bigger than <code>int</code> can hold, so use <code>long long</code> and <code>%lld</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    long long fact = 1;                //> Start at 1 (multiplying by 0 would ruin everything). {long long} holds up to about 9.2 × 10¹⁸.
    for (int i = 2; i <= n; i++) {     //> Starting from 2 is fine, because multiplying by 1 changes nothing.
        fact *= i;                     //> {fact = fact × i}.
    }
    printf("%d! = %lld\n", n, fact);   //> {%lld} is the format for long long.
    return 0;
}`,
    traps: ['Using <code>int</code>: 13! = 6 227 020 800 overflows and prints a wrong (even negative) number.'] });

  P({ id: 'lp-table', group: 'loops:A', title: 'Multiplication table of n', level: 'easy', input: '7',
    prompt: '<p>Print n × 1 up to n × 10.</p>',
    idea: '<p>A fixed number of iterations (10) → <code>for</code>. Use the format string to line up the columns: <code>%2d</code> pads to 2 characters.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= 10; i++) {
        printf("%d x %2d = %3d\n", n, i, n * i); //> Three placeholders, filled from left to right with {n}, {i}, {n * i}. {%2d} / {%3d} pad with spaces so the columns line up.
    }
    return 0;
}` });

  P({ id: 'lp-fizzbuzz', group: 'loops:A', title: 'Fizz Buzz', level: 'easy', input: '15', lc: { n: 412, slug: 'fizz-buzz' },
    prompt: '<p>For 1…n print “Fizz” for multiples of 3, “Buzz” for multiples of 5, “FizzBuzz” for multiples of both, otherwise the number. (LeetCode wants an array of strings back. Here we print, and the logic is identical.)</p>',
    idea: '<p>The <b>order of the checks matters</b>. 15 is a multiple of 3, so if you test <code>% 3</code> first you print “Fizz” and never reach “FizzBuzz”. Test the most specific case (<code>% 15</code>) first.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        if (i % 15 == 0) {           //> Divisible by both 3 and 5 → must be checked <b>first</b>.
            printf("FizzBuzz\n");
        } else if (i % 3 == 0) {     //> Only reached when the first test failed.
            printf("Fizz\n");
        } else if (i % 5 == 0) {
            printf("Buzz\n");
        } else {
            printf("%d\n", i);       //> None of the above.
        }
    }
    return 0;
}`,
    complexity: 'O(n).' });

  P({ id: 'lp-fib', group: 'loops:A', title: 'Fibonacci number', level: 'easy', input: '10', lc: { n: 509, slug: 'fibonacci-number' },
    prompt: '<p>F(0) = 0, F(1) = 1, F(n) = F(n−1) + F(n−2). Return F(n).</p>',
    idea: '<p>You only ever need the <b>last two</b> numbers. Keep them in <code>a</code> and <code>b</code> and slide them forward: the new pair is <code>(b, a + b)</code>. This is the loop version of what recursion and DP do later.</p>',
    code: R`
#include <stdio.h>

int fib(int n) {                 //> The LeetCode function. On LeetCode you submit only this part.
    if (n < 2) return n;         //> F(0) = 0, F(1) = 1.
    int a = 0, b = 1;            //> a = F(i−2), b = F(i−1).
    for (int i = 2; i <= n; i++) {
        int c = a + b;           //> F(i).
        a = b;                   //> Slide the window forward by one …
        b = c;                   //> … so {b} is now F(i).
    }
    return b;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", fib(n));      //> Call the function and print what it returns.
    return 0;
}`,
    complexity: 'O(n) time, O(1) space.',
    traps: ['Doing <code>a = b; b = a + b;</code> without a temporary: <code>a</code> has already changed by the time you add.'] });

  P({ id: 'lp-steps', group: 'loops:A', title: 'Number of steps to reduce a number to zero', level: 'easy', input: '14', lc: { n: 1342, slug: 'number-of-steps-to-reduce-a-number-to-zero' },
    prompt: '<p>If the number is even, halve it. Otherwise subtract 1. Count the steps until it reaches 0.</p>',
    idea: '<p>A <b>simulation</b>: just do what the problem says, inside a <code>while</code> loop that runs until the stopping condition. Count each iteration.</p>',
    code: R`
#include <stdio.h>

int numberOfSteps(int num) {
    int steps = 0;
    while (num > 0) {            //> We don’t know in advance how many steps it takes → {while}.
        if (num % 2 == 0) {
            num /= 2;            //> Even → halve.
        } else {
            num -= 1;            //> Odd → subtract one.
        }
        steps++;                 //> Count this step.
    }
    return steps;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", numberOfSteps(n));
    return 0;
}`,
    complexity: 'O(log n): halving happens at least every other step.' });

  P({ id: 'lp-water', group: 'loops:A', title: 'Water bottles', level: 'easy', input: '15 4', lc: { n: 1518, slug: 'water-bottles' },
    prompt: '<p>You have <code>numBottles</code> full bottles and can exchange <code>numExchange</code> empty bottles for one full one. How many bottles can you drink in total?</p>',
    idea: '<p>Simulate the exchanges with a <code>while</code> loop. Keep track of the <b>empty</b> bottles: trade as many groups as possible, and remember that the leftovers (<code>%</code>) carry over to the next round.</p>',
    code: R`
#include <stdio.h>

int numWaterBottles(int numBottles, int numExchange) {
    int drunk = numBottles;             //> Drink all the full ones first.
    int empty = numBottles;             //> They are now empty.
    while (empty >= numExchange) {      //> Can we still trade?
        int fresh = empty / numExchange; //> New full bottles from the trade.
        empty = empty % numExchange;    //> Leftover empties that couldn’t be traded …
        drunk += fresh;                 //> … drink the new ones …
        empty += fresh;                 //> … and they become empty too.
    }
    return drunk;
}

int main() {
    int b, e;
    scanf("%d %d", &b, &e);
    printf("%d\n", numWaterBottles(b, e));
    return 0;
}` });

  // ------------------------------------------------------------ digits
  P({ id: 'lp-count-digits', group: 'loops:B', title: 'Count digits', level: 'easy', input: '90210', gfg: 'https://www.geeksforgeeks.org/problems/count-digits5716/1',
    prompt: '<p>How many digits does n have?</p>',
    idea: '<p>Each <code>n / 10</code> removes one digit, so count how many times you can do it before n becomes 0. (A shortcut: <code>(int)log10(n) + 1</code>.)</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int count = 0;
    while (n > 0) {
        n = n / 10;            //> Chop off the last digit.
        count++;               //> One more digit seen.
    }
    printf("%d\n", count);
    return 0;
}`,
    complexity: 'O(number of digits) = O(log₁₀ n).',
    traps: ['For n = 0 this prints 0. Use the do-while version from the notes if 0 can be an input.'] });

  P({ id: 'lp-sub-prod-sum', group: 'loops:B', title: 'Subtract the product and sum of digits', level: 'easy', input: '234', lc: { n: 1281, slug: 'subtract-the-product-and-sum-of-digits-of-an-integer' },
    prompt: '<p>Return (product of digits) − (sum of digits).</p>',
    idea: '<p>Peel digits and run <b>two accumulators</b> at once: product starts at 1, sum starts at 0.</p>',
    code: R`
#include <stdio.h>

int subtractProductAndSum(int n) {
    int product = 1, sum = 0;   //> Product starts at 1, sum starts at 0.
    while (n > 0) {
        int d = n % 10;         //> Last digit.
        product *= d;
        sum += d;
        n /= 10;                //> Remove it.
    }
    return product - sum;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", subtractProductAndSum(n));
    return 0;
}` });

  P({ id: 'lp-reverse', group: 'loops:B', title: 'Reverse integer', level: 'medium', input: '-1234', lc: { n: 7, slug: 'reverse-integer' },
    prompt: '<p>Reverse the digits of a 32-bit signed integer. If the result overflows, return 0.</p>',
    idea: '<p>Build the answer digit by digit: <code>rev = rev × 10 + digit</code>. Each step shifts the existing digits left and appends the new one. In C, <code>-1234 % 10</code> is <code>-4</code>, so negative numbers work without special handling. The difficult part is overflow: check <b>before</b> multiplying, by comparing with <code>INT_MAX / 10</code>.</p>',
    code: R`
#include <stdio.h>
#include <limits.h>

int reverse(int x) {
    int rev = 0;
    while (x != 0) {                                 //> {!= 0} (not {> 0}) so negative numbers work too.
        int d = x % 10;                              //> Last digit (negative if x is negative).
        if (rev > INT_MAX / 10 || rev < INT_MIN / 10) { //> If rev × 10 would go past the int range, stop now. Checking after multiplying is too late.
            return 0;
        }
        rev = rev * 10 + d;                          //> Shift left and append the digit: 43 → 432.
        x /= 10;
    }
    return rev;
}

int main() {
    int x;
    scanf("%d", &x);
    printf("%d\n", reverse(x));
    return 0;
}`,
    complexity: 'O(log₁₀ x) — at most 10 iterations.',
    tryit: ['Run it with <code>1534236469</code>. The reversed number does not fit in an int, so the answer is 0.'] });

  P({ id: 'lp-palin', group: 'loops:B', title: 'Palindrome number', level: 'easy', input: '12321', lc: { n: 9, slug: 'palindrome-number' },
    prompt: '<p>Is x the same forwards and backwards?</p>',
    idea: '<p>Reverse the number (as in the previous problem) and compare it with the original. You need to <b>keep a copy</b>, because the loop destroys <code>x</code>. Negative numbers are never palindromes (the <code>-</code> is only on one side).</p>',
    code: R`
#include <stdio.h>
#include <stdbool.h>

bool isPalindrome(int x) {
    if (x < 0) return false;          //> “-121” read backwards is “121-”.
    long long rev = 0;                //> long long so reversing a big number can’t overflow.
    int original = x;                 //> Save it, because the loop changes x.
    while (x > 0) {
        rev = rev * 10 + x % 10;
        x /= 10;
    }
    return rev == original;           //> A comparison gives true or false directly.
}

int main() {
    int x;
    scanf("%d", &x);
    printf(isPalindrome(x) ? "true\n" : "false\n");
    return 0;
}` });

  P({ id: 'lp-armstrong', group: 'loops:B', title: 'Armstrong number', level: 'easy', input: '153', gfg: 'https://www.geeksforgeeks.org/problems/armstrong-numbers2727/1',
    prompt: '<p>A number is Armstrong if the sum of its digits, each raised to the power (number of digits), equals the number. 153 = 1³ + 5³ + 3³.</p>',
    idea: '<p><b>Two passes</b> over the digits: the first counts them (to get the power), the second sums the powers. Each pass needs its own copy of n.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int digits = 0;
    for (int t = n; t > 0; t /= 10) digits++;   //> Pass 1: count the digits. A {for} loop works with any update, here {t /= 10}.
    int sum = 0;
    for (int t = n; t > 0; t /= 10) {           //> Pass 2: go over the digits again with a fresh copy.
        int d = t % 10;
        int p = 1;
        for (int k = 0; k < digits; k++) p *= d; //> d to the power digits, by repeated multiplication (a nested loop).
        sum += p;
    }
    if (sum == n) printf("%d is an Armstrong number\n", n);
    else printf("%d is not an Armstrong number\n", n);
    return 0;
}` });

  P({ id: 'lp-digits-divide', group: 'loops:B', title: 'Count the digits that divide a number', level: 'easy', input: '1248', lc: { n: 2520, slug: 'count-the-digits-that-divide-a-number' },
    prompt: '<p>Count the digits <code>d</code> of num such that <code>num % d == 0</code>.</p>',
    idea: '<p>Peel digits from a <b>copy</b> and test each one against the <b>original</b> number.</p>',
    code: R`
#include <stdio.h>

int countDigits(int num) {
    int count = 0;
    for (int t = num; t > 0; t /= 10) {   //> {t} is a copy that we can destroy.
        int d = t % 10;
        if (num % d == 0) count++;        //> Test against the original {num}, not {t}.
    }
    return count;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", countDigits(n));
    return 0;
}` });

  P({ id: 'lp-add-digits', group: 'loops:B', title: 'Add digits until one digit is left', level: 'easy', input: '9875', lc: { n: 258, slug: 'add-digits' },
    prompt: '<p>Repeatedly replace num by the sum of its digits until it has one digit.</p>',
    idea: '<p>A <b>loop inside a loop</b>: the inner loop sums the digits once, and the outer loop repeats while the result still has 2+ digits. (There is an O(1) maths trick: <code>1 + (num − 1) % 9</code>.)</p>',
    code: R`
#include <stdio.h>

int addDigits(int num) {
    while (num >= 10) {          //> Still more than one digit → do another round.
        int s = 0;
        while (num > 0) {        //> One round: sum the digits.
            s += num % 10;
            num /= 10;
        }
        num = s;                 //> The sum becomes the new number.
    }
    return num;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", addDigits(n));
    return 0;
}` });

  // ------------------------------------------------------------ divisors / primes / gcd
  P({ id: 'lp-divisors', group: 'loops:C', title: 'Print all divisors (√n method)', level: 'easy', input: '36', gfg: 'https://www.geeksforgeeks.org/problems/all-divisors-of-a-number/1',
    prompt: '<p>Print every number that divides n.</p>',
    idea: '<p>Divisors come in <b>pairs</b>: if <code>i</code> divides n, so does <code>n / i</code>, and one of the two is always ≤ √n. So loop only while <code>i × i ≤ n</code> and print both members of each pair. When <code>i == n / i</code> (a perfect square), print it once.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i * i <= n; i++) {   //> Stop at √n. {i * i <= n} avoids calling sqrt.
        if (n % i == 0) {
            printf("%d ", i);            //> Small divisor of the pair.
            if (i != n / i) {
                printf("%d ", n / i);    //> Its partner, unless it is the same number (as with 6 × 6 = 36).
            }
        }
    }
    printf("\n");
    return 0;
}`,
    complexity: 'O(√n) instead of O(n). For n = 10⁹ that is about 31 623 steps instead of a billion.',
    tryit: ['Watch the trace for n = 36: the loop stops at i = 6.'] });

  P({ id: 'lp-prime', group: 'loops:C', title: 'Check for prime', level: 'easy', input: '97', gfg: 'https://www.geeksforgeeks.org/problems/prime-number2314/1',
    prompt: '<p>Is n prime (exactly two divisors, 1 and itself)?</p>',
    idea: '<p>If n has any divisor other than 1 and n, one of them is ≤ √n. Try every <code>i</code> from 2 while <code>i × i ≤ n</code>, and <b>break as soon as one divides</b>. This loop uses a <b>flag</b> variable.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int isPrime = (n >= 2);              //> Flag: 1 = still looks prime. 0 and 1 are not prime.
    for (int i = 2; i * i <= n; i++) {
        if (n % i == 0) {
            isPrime = 0;                 //> Found a divisor → not prime …
            break;                       //> … so there is no point checking more numbers.
        }
    }
    if (isPrime) printf("%d is prime\n", n);
    else printf("%d is not prime\n", n);
    return 0;
}`,
    complexity: 'O(√n).' });

  P({ id: 'lp-primes-upto', group: 'loops:C', title: 'All primes up to n (nested loops)', level: 'medium', input: '30',
    prompt: '<p>Print every prime number from 2 to n.</p>',
    idea: '<p>Put the prime check from the previous problem <b>inside</b> another loop: the outer loop picks a candidate, the inner loop tests it. This is a nested loop whose inner part depends on the outer variable. (The Sieve of Eratosthenes in the Maths chapter does this much faster.)</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int x = 2; x <= n; x++) {       //> Outer: each candidate number.
        int prime = 1;                   //> Reset the flag for every new candidate.
        for (int i = 2; i * i <= x; i++) { //> Inner: try divisors of x up to √x.
            if (x % i == 0) { prime = 0; break; } //> {break} leaves only the <b>inner</b> loop. The outer loop carries on with the next x.
        }
        if (prime) printf("%d ", x);
    }
    printf("\n");
    return 0;
}`,
    complexity: 'O(n √n).',
    traps: ['<code>break</code> only exits the innermost loop it is in.'] });

  P({ id: 'lp-gcd', group: 'loops:C', title: 'GCD with Euclid’s algorithm', level: 'easy', input: '48 18', gfg: 'https://www.geeksforgeeks.org/problems/gcd-of-two-numbers3459/1',
    prompt: '<p>Find the greatest common divisor of a and b.</p>',
    idea: '<p>gcd(a, b) = gcd(b, a % b), and gcd(a, 0) = a. Each step shrinks the numbers quickly. Watch the trace table: the pair (a, b) slides one place to the left each iteration.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    while (b != 0) {          //> When b reaches 0, a holds the answer.
        int r = a % b;        //> The remainder …
        a = b;                //> … the pair slides: (a, b) becomes (b, a % b).
        b = r;
    }
    printf("gcd = %d\n", a);
    return 0;
}`,
    complexity: 'O(log min(a, b)).',
    tryit: ['LCM = a × b / gcd. Add it (keep the original a and b in copies first).'] });

  P({ id: 'lp-pow2', group: 'loops:C', title: 'Power of two', level: 'easy', input: '64', lc: { n: 231, slug: 'power-of-two' },
    prompt: '<p>Is n a power of two?</p>',
    idea: '<p>Keep dividing by 2 while n is even. A power of two ends at exactly 1. (Bit trick for later: <code>n &gt; 0 &amp;&amp; (n &amp; (n − 1)) == 0</code>.)</p>',
    code: R`
#include <stdio.h>
#include <stdbool.h>

bool isPowerOfTwo(int n) {
    if (n <= 0) return false;     //> 0 and negative numbers are never powers of two.
    while (n % 2 == 0) {
        n /= 2;                   //> Remove one factor of 2.
    }
    return n == 1;                //> Only 1 left → it was 2 × 2 × … × 2.
}

int main() {
    int n;
    scanf("%d", &n);
    printf(isPowerOfTwo(n) ? "true\n" : "false\n");
    return 0;
}` });

  // ------------------------------------------------------------ nested loops
  P({ id: 'lp-tables', group: 'loops:D', title: 'Multiplication grid 1…n', level: 'easy', input: '5',
    prompt: '<p>Print the n × n multiplication grid.</p>',
    idea: '<p>The cell in row i, column j is <code>i × j</code>. With nested loops the outer variable is the row and the inner variable is the column, the same as in patterns.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n; j++) {
            printf("%4d", i * j);   //> {%4d} right-aligns every number in 4 characters, which makes neat columns.
        }
        printf("\n");
    }
    return 0;
}` });

  P({ id: 'lp-pairs', group: 'loops:D', title: 'Count pairs i < j with i + j = k', level: 'medium', input: '6 7',
    prompt: '<p>Given n and k, count pairs <code>1 ≤ i &lt; j ≤ n</code> with <code>i + j = k</code>.</p>',
    idea: '<p>Starting the inner loop at <code>j = i + 1</code> means each pair is visited <b>once</b> and never with <code>i == j</code>. This “upper triangle” loop is used in many array problems (2-Sum brute force).</p>',
    code: R`
#include <stdio.h>

int main() {
    int n, k;
    scanf("%d %d", &n, &k);
    int count = 0;
    for (int i = 1; i <= n; i++) {
        for (int j = i + 1; j <= n; j++) {   //> j starts right after i → (i, j) with i < j, so no pair is counted twice.
            if (i + j == k) {
                printf("(%d,%d) ", i, j);
                count++;
            }
        }
    }
    printf("\ncount = %d\n", count);
    return 0;
}`,
    complexity: 'n(n−1)/2 pairs → O(n²).' });
  // ------------------------------------------------------------ more loop practice (LeetCode)
  P({ id: 'lp-common-factors', group: 'loops:E', title: 'Number of common factors', level: 'easy', input: '12 6', tests: ['25 30'], lc: { n: 2427, slug: 'number-of-common-factors' },
    prompt: '<p>Count the integers that divide both a and b.</p>',
    idea: '<p>A common factor can’t be bigger than the smaller number, so loop up to <code>min(a, b)</code> and count the numbers that divide both.</p>',
    code: R`
#include <stdio.h>

int commonFactors(int a, int b) {
    int lim = a < b ? a : b;          //> No common factor can be bigger than min(a, b).
    int count = 0;
    for (int x = 1; x <= lim; x++) {
        if (a % x == 0 && b % x == 0) count++;   //> Divides both.
    }
    return count;
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\n", commonFactors(a, b));
    return 0;
}` });

  P({ id: 'lp-alt-digit', group: 'loops:E', title: 'Alternating digit sum', level: 'easy', input: '521', tests: ['111', '886996'], lc: { n: 2544, slug: 'alternating-digit-sum' },
    prompt: '<p>The most significant digit gets +, the next −, and so on. 521 → 5 − 2 + 1 = 4.</p>',
    idea: '<p>Peeling digits gives them from the <b>right</b>, but the signs start at the <b>left</b>. Sum with signs from the right (+, −, + …). If the number has an <b>even</b> number of digits, the leftmost digit got a − sign, so negate the whole answer.</p>',
    code: R`
#include <stdio.h>

int alternateDigitSum(int n) {
    int sum = 0, sign = 1, digits = 0;
    while (n > 0) {
        sum += sign * (n % 10);       //> Signs from the right: +, −, +, …
        sign = -sign;
        digits++;
        n /= 10;
    }
    if (digits % 2 == 0) sum = -sum; //> With an even count, the leftmost digit got −, so flip everything.
    return sum;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", alternateDigitSum(n));
    return 0;
}` });

  P({ id: 'lp-harshad', group: 'loops:E', title: 'Harshad number', level: 'easy', input: '18', tests: ['23'], lc: { n: 3099, slug: 'harshad-number' },
    prompt: '<p>x is a Harshad number if it is divisible by the sum of its digits. Return that sum, or −1.</p>',
    idea: '<p>Digit sum on a <b>copy</b> (the loop destroys it), then one test against the original.</p>',
    code: R`
#include <stdio.h>

int sumOfTheDigitsOfHarshadNumber(int x) {
    int s = 0;
    for (int t = x; t > 0; t /= 10) s += t % 10;  //> Digit sum of a copy.
    if (x % s == 0) return s;
    return -1;
}

int main() {
    int x;
    scanf("%d", &x);
    printf("%d\n", sumOfTheDigitsOfHarshadNumber(x));
    return 0;
}` });

  P({ id: 'lp-three-div', group: 'loops:E', title: 'Three divisors', level: 'easy', input: '4', tests: ['12', '49'], lc: { n: 1952, slug: 'three-divisors' },
    prompt: '<p>Does n have exactly three positive divisors?</p>',
    idea: '<p>Count divisors with the √n pair trick, then compare the count with 3. (Only squares of primes have exactly 3 divisors: 1, p, p².)</p>',
    code: R`
#include <stdio.h>
#include <stdbool.h>

bool isThree(int n) {
    int count = 0;
    for (int i = 1; i * i <= n; i++) {
        if (n % i == 0) {
            count++;                       //> i is a divisor …
            if (i != n / i) count++;       //> … and so is its partner n / i.
        }
    }
    return count == 3;
}

int main() {
    int n;
    scanf("%d", &n);
    printf(isThree(n) ? "true\n" : "false\n");
    return 0;
}` });

  P({ id: 'lp-self-div', group: 'loops:E', title: 'Self dividing numbers', level: 'easy', input: '1 22', tests: ['47 85'], lc: { n: 728, slug: 'self-dividing-numbers' },
    prompt: '<p>Print all numbers in [left, right] that are divisible by every one of their digits (and contain no 0).</p>',
    idea: '<p>Nested loops: the outer loop goes over the range, and the inner loop checks the digits of one number. A <b>flag</b> plus <code>break</code> stops the digit check at the first bad digit.</p>',
    code: R`
#include <stdio.h>

int main() {
    int left, right;
    scanf("%d %d", &left, &right);
    for (int x = left; x <= right; x++) {
        int ok = 1;                           //> Assume x is good until a digit proves otherwise.
        for (int t = x; t > 0; t /= 10) {
            int d = t % 10;
            if (d == 0 || x % d != 0) { ok = 0; break; } //> A zero digit or a digit that doesn’t divide → reject.
        }
        if (ok) printf("%d ", x);
    }
    printf("\n");
    return 0;
}` });

  P({ id: 'lp-nozero', group: 'loops:E', title: 'Convert integer to the sum of two no-zero integers', level: 'easy', input: '11', tests: ['101', '2'], lc: { n: 1317, slug: 'convert-integer-to-the-sum-of-two-no-zero-integers' },
    prompt: '<p>Find a + b = n where neither a nor b contains the digit 0.</p>',
    idea: '<p>Write a small helper <code>hasZero(x)</code>, then try a = 1, 2, 3 … until both a and n − a pass. A helper function keeps the main loop short and easy to read.</p>',
    code: R`
#include <stdio.h>

int hasZero(int x) {
    for (; x > 0; x /= 10) {
        if (x % 10 == 0) return 1;   //> Found a 0 digit.
    }
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    for (int a = 1; a < n; a++) {
        if (!hasZero(a) && !hasZero(n - a)) {   //> {!} turns “has a zero” into “has no zero”.
            printf("%d %d\n", a, n - a);
            break;                               //> The first valid pair is enough.
        }
    }
    return 0;
}` });

  P({ id: 'lp-pow3', group: 'loops:E', title: 'Power of three', level: 'easy', input: '27', tests: ['45', '1'], lc: { n: 326, slug: 'power-of-three' },
    prompt: '<p>Is n a power of 3?</p>',
    idea: '<p>Divide by 3 for as long as it divides evenly. Only a power of 3 ends up at exactly 1.</p>',
    code: R`
#include <stdio.h>
#include <stdbool.h>

bool isPowerOfThree(int n) {
    if (n <= 0) return false;
    while (n % 3 == 0) n /= 3;    //> Strip every factor of 3.
    return n == 1;
}

int main() {
    int n;
    scanf("%d", &n);
    printf(isPowerOfThree(n) ? "true\n" : "false\n");
    return 0;
}` });

  P({ id: 'lp-sqrt', group: 'loops:E', title: 'Sqrt(x) by linear search', level: 'easy', input: '8', tests: ['16', '0'], lc: { n: 69, slug: 'sqrtx' },
    prompt: '<p>Return ⌊√x⌋ without sqrt().</p>',
    idea: '<p>Find the largest i with <code>i × i ≤ x</code>. Use <code>long long</code> so <code>i × i</code> can’t overflow. (Binary search makes it O(log x), which is covered in the Binary Search chapter.)</p>',
    code: R`
#include <stdio.h>

int mySqrt(int x) {
    long long i = 0;
    while ((i + 1) * (i + 1) <= x) i++;   //> Step up while the next square still fits.
    return (int)i;
}

int main() {
    int x;
    scanf("%d", &x);
    printf("%d\n", mySqrt(x));
    return 0;
}`,
    complexity: 'O(√x).' });

  P({ id: 'lp-perfect-sq', group: 'loops:E', title: 'Valid perfect square', level: 'easy', input: '16', tests: ['14'], lc: { n: 367, slug: 'valid-perfect-square' },
    prompt: '<p>Is num a perfect square?</p>',
    idea: '<p>The same loop as Sqrt(x), but stop when the square reaches or passes num, then check whether it is exactly equal.</p>',
    code: R`
#include <stdio.h>
#include <stdbool.h>

bool isPerfectSquare(int num) {
    long long i = 1;
    while (i * i < num) i++;     //> Smallest i with i² ≥ num.
    return i * i == num;         //> Exactly equal → a perfect square.
}

int main() {
    int n;
    scanf("%d", &n);
    printf(isPerfectSquare(n) ? "true\n" : "false\n");
    return 0;
}` });

  P({ id: 'lp-even-digit-sum', group: 'loops:E', title: 'Count integers with even digit sum', level: 'easy', input: '30', tests: ['4'], lc: { n: 2180, slug: 'count-integers-with-even-digit-sum' },
    prompt: '<p>How many integers in 1…num have an even digit sum?</p>',
    idea: '<p>Nested loops again: every number (outer) and its digits (inner). Reset the inner accumulator for each new number.</p>',
    code: R`
#include <stdio.h>

int countEven(int num) {
    int count = 0;
    for (int x = 1; x <= num; x++) {
        int s = 0;                                 //> Reset for every x.
        for (int t = x; t > 0; t /= 10) s += t % 10;
        if (s % 2 == 0) count++;
    }
    return count;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", countEven(n));
    return 0;
}` });

  P({ id: 'lp-69', group: 'loops:E', title: 'Maximum 69 number', level: 'easy', input: '9669', tests: ['9996', '9999'], lc: { n: 1323, slug: 'maximum-69-number' },
    prompt: '<p>The number has only digits 6 and 9. Change at most one digit to get the maximum.</p>',
    idea: '<p>Turn the <b>leftmost 6</b> into a 9, which adds <code>3 × place</code>. Peeling from the right, keep updating the place value of the latest 6 you see. The last one seen is the leftmost.</p>',
    code: R`
#include <stdio.h>

int maximum69Number(int num) {
    int place = 1, best = 0;               //> best = place value of the leftmost 6 (0 = none).
    for (int t = num; t > 0; t /= 10) {
        if (t % 10 == 6) best = place;     //> Later (more to the left) 6s overwrite earlier ones.
        place *= 10;
    }
    return num + 3 * best;                 //> 6 → 9 adds 3 at that position.
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", maximum69Number(n));
    return 0;
}` });

  P({ id: 'lp-symmetric', group: 'loops:E', title: 'Count symmetric integers', level: 'easy', input: '1200 1230', tests: ['1 100'], lc: { n: 2843, slug: 'count-symmetric-integers' },
    prompt: '<p>A 2k-digit number is symmetric if its first k digits and last k digits have the same sum. Count them in [low, high] (high ≤ 10⁴).</p>',
    idea: '<p>Only 2-digit and 4-digit numbers can qualify. For 2 digits that means both digits are equal (<code>x % 11 == 0</code>). For 4 digits, compare <code>x / 1000 + x / 100 % 10</code> with <code>x / 10 % 10 + x % 10</code>.</p>',
    code: R`
#include <stdio.h>

int countSymmetricIntegers(int low, int high) {
    int count = 0;
    for (int x = low; x <= high; x++) {
        if (x >= 10 && x <= 99) {
            if (x % 11 == 0) count++;                 //> 11, 22, …, 99.
        } else if (x >= 1000 && x <= 9999) {
            int left = x / 1000 + x / 100 % 10;       //> First two digits.
            int right = x / 10 % 10 + x % 10;         //> Last two digits.
            if (left == right) count++;
        }
    }
    return count;
}

int main() {
    int lo, hi;
    scanf("%d %d", &lo, &hi);
    printf("%d\n", countSymmetricIntegers(lo, hi));
    return 0;
}` });

  P({ id: 'lp-dec2bin', group: 'loops:E', title: 'Decimal to binary', level: 'easy', input: '13', tests: ['8', '255'],
    prompt: '<p>Print the binary form of n (as a number made of 0s and 1s).</p>',
    idea: '<p><code>n % 2</code> is the last binary digit and <code>n / 2</code> removes it, just like <code>% 10</code> and <code>/ 10</code> for decimal digits. The bits come out right-to-left, so place each one at the next <b>place value</b> (1, 10, 100 …) of the answer.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    long long bin = 0, place = 1;
    while (n > 0) {
        int bit = n % 2;            //> The lowest binary digit.
        bin += bit * place;         //> Put it in the next decimal column.
        place *= 10;
        n /= 2;                     //> Remove that bit.
    }
    printf("%lld\n", bin);
    return 0;
}` });

  P({ id: 'lp-bin2dec', group: 'loops:E', title: 'Binary to decimal', level: 'easy', input: '1101', tests: ['100000', '11111111'],
    prompt: '<p>Read a number made of 0s and 1s and print its decimal value.</p>',
    idea: '<p>The reverse direction: peel decimal digits (each one is a bit) and weigh them by 1, 2, 4, 8 …</p>',
    code: R`
#include <stdio.h>

int main() {
    long long b;
    scanf("%lld", &b);
    int value = 0, weight = 1;
    while (b > 0) {
        value += (b % 10) * weight;  //> Bit × 2^position.
        weight *= 2;
        b /= 10;
    }
    printf("%d\n", value);
    return 0;
}` });

  P({ id: 'lp-distance', group: 'loops:E', title: 'Total distance traveled', level: 'easy', input: '5 10', tests: ['1 2', '9 2'], lc: { n: 2739, slug: 'total-distance-traveled' },
    prompt: '<p>A truck does 10 km per litre. Every time 5 litres of the main tank are used, 1 litre moves over from the additional tank (if any is left). Total distance?</p>',
    idea: '<p>Simulate it in chunks of 5 litres with a <code>while</code>, refilling 1 litre when allowed. Whatever is left at the end is fewer than 5 litres, and it is simply driven.</p>',
    code: R`
#include <stdio.h>

int distanceTraveled(int mainTank, int additionalTank) {
    int dist = 0;
    while (mainTank >= 5) {
        mainTank -= 5;                      //> Burn 5 litres …
        dist += 50;                         //> … for 50 km.
        if (additionalTank > 0) {           //> Top-up rule.
            additionalTank--;
            mainTank++;
        }
    }
    return dist + mainTank * 10;            //> The remaining fuel (under 5 litres).
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\n", distanceTraveled(a, b));
    return 0;
}` });
})();
