// C basics: worked examples for the notes + problems.
(function () {
  const P = CN.add, R = String.raw;

  // ------------------------------------------------------------ examples inside the notes
  P({ id: 'ex-hello', example: true, title: 'Your first program',
    code: R`
#include <stdio.h>

int main() {
    printf("Hello, World!\n");   //> {printf} prints the text between the quotes. {\n} is one character: “new line”.
    printf("C is fun.\n");       //> Statements run from top to bottom, one after another.
    return 0;
}` });

  P({ id: 'ex-types', example: true, title: 'Variables and their types',
    prompt: '<p>Each variable has a <b>type</b>, which decides what it can hold and which <code>printf</code> placeholder prints it. Look at the Variables panel as you step through.</p>',
    code: R`
#include <stdio.h>

int main() {
    int age = 20;                 //> {int}: whole numbers, about ±2.1 billion. Printed with {%d}.
    long long big = 9000000000LL; //> {long long}: much bigger whole numbers (±9.2 × 10¹⁸). {%lld}. The {LL} suffix marks the literal as long long.
    double pi = 3.14159;          //> {double}: numbers with a decimal point. {%lf} for scanf, {%f} for printf.
    char grade = 'A';             //> {char}: one character in single quotes. It is really the number 65. {%c}.
    printf("%d %lld\n", age, big);
    printf("%.2f\n", pi);         //> {%.2f} prints 2 digits after the decimal point → 3.14.
    printf("%c = %d\n", grade, grade); //> The same char printed two ways: as a letter and as its ASCII code.
    return 0;
}` });

  P({ id: 'ex-io', example: true, title: 'Reading input with scanf', input: '7 5',
    prompt: '<p>Change the input box (for example <code>10 3</code>) and press <b>Run with this input</b>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, b;                     //> Declared but not set: they hold garbage until scanf fills them (shown as ? in the Variables panel).
    scanf("%d %d", &a, &b);       //> Read two integers. {&a} means “the address of a”, so scanf can write into a.
    printf("a + b = %d\n", a + b);
    printf("a - b = %d\n", a - b);
    printf("a * b = %d\n", a * b);
    return 0;
}` });

  P({ id: 'ex-div', example: true, title: 'Integer division and modulo', input: '17 5',
    code: R`
#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d / %d = %d\n", a, b, a / b);  //> Both are ints → <b>integer division</b>: the fractional part is thrown away. 17 / 5 = 3, not 3.4.
    printf("%d %% %d = %d\n", a, b, a % b); //> {%} gives the remainder: 17 = 5 × 3 + 2. ({%%} prints a literal %.)
    double exact = (double)a / b;           //> Casting one operand to double makes the division exact.
    printf("exact = %.2f\n", exact);
    printf("-7 / 2 = %d, -7 %% 2 = %d\n", -7 / 2, -7 % 2); //> C rounds towards zero: −7 / 2 = −3, and the remainder takes the sign of the left side: −1.
    return 0;
}` });

  P({ id: 'ex-incr', example: true, title: 'i++ versus ++i',
    prompt: '<p>Both add 1. The difference is <b>which value the expression gives</b>: the old one (<code>i++</code>) or the new one (<code>++i</code>).</p>',
    code: R`
#include <stdio.h>

int main() {
    int i = 5;
    int a = i++;          //> Post-increment: {a} gets the <b>old</b> value 5, then {i} becomes 6.
    int b = ++i;          //> Pre-increment: {i} becomes 7 first, then {b} gets 7.
    printf("a=%d b=%d i=%d\n", a, b, i);
    int x = 10;
    x += 3;               //> Compound assignment: {x = x + 3}.
    x *= 2;               //> {x = x * 2} → 26.
    printf("x=%d\n", x);
    return 0;
}` });

  P({ id: 'ex-if', example: true, title: 'if / else if / else', input: '73',
    prompt: '<p>Only <b>one</b> branch of an if-else ladder runs: the first whose condition is true. Try 95, 73 and 20.</p>',
    code: R`
#include <stdio.h>

int main() {
    int marks;
    scanf("%d", &marks);
    if (marks >= 80) {           //> Checked first.
        printf("A+\n");
    } else if (marks >= 70) {    //> Checked only if the first test failed, so here we already know marks < 80.
        printf("A\n");
    } else if (marks >= 60) {
        printf("B\n");
    } else {                     //> None of the tests passed.
        printf("Fail\n");
    }
    return 0;
}` });

  P({ id: 'ex-logic', example: true, title: 'Logical operators && || !', input: '2024',
    prompt: '<p>Leap year rule: divisible by 4 <b>and</b> not by 100, <b>or</b> divisible by 400.</p>',
    code: R`
#include <stdio.h>

int main() {
    int y;
    scanf("%d", &y);
    int leap = (y % 4 == 0 && y % 100 != 0) || (y % 400 == 0); //> {&&} = both must be true, {||} = at least one, {!=} = not equal. A comparison gives 1 (true) or 0 (false).
    if (leap) printf("%d is a leap year\n", y);  //> Any non-zero value counts as true in C.
    else printf("%d is not a leap year\n", y);
    return 0;
}` });

  P({ id: 'ex-switch', example: true, title: 'switch and fall-through', input: '3',
    code: R`
#include <stdio.h>

int main() {
    int day;
    scanf("%d", &day);
    switch (day) {                   //> Jump straight to the matching {case}.
        case 1: printf("Monday\n"); break;   //> {break} leaves the switch. Without it, execution “falls through” into the next case.
        case 2: printf("Tuesday\n"); break;
        case 3: printf("Wednesday\n"); break;
        case 6:
        case 7: printf("Weekend!\n"); break; //> Two cases sharing one body: 6 falls through to 7.
        default: printf("Another weekday\n"); //> Runs when no case matches.
    }
    return 0;
}` });

  P({ id: 'ex-func', example: true, title: 'Functions and pass-by-value', input: '3 4',
    prompt: '<p>Watch the <b>stack frames</b>: calling a function creates a new frame with <b>copies</b> of the arguments. Changing the copy does not change the caller’s variable.</p>',
    code: R`
#include <stdio.h>

int square(int x) {          //> A function: takes an {int x}, gives back ({return}) an int.
    return x * x;
}

void tryToChange(int x) {    //> {void} = returns nothing.
    x = 100;                 //> Changes only the <b>copy</b> inside this frame.
}

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    int s = square(a) + square(b); //> Two calls. Each one runs, returns, and its frame is removed.
    printf("%d^2 + %d^2 = %d\n", a, b, s);
    tryToChange(a);
    printf("a is still %d\n", a);  //> Pass-by-value: the caller’s {a} was never touched.
    return 0;
}` });

  P({ id: 'ex-cpp', example: true, title: 'The same program in C++', input: '6 7',
    prompt: '<p>C++ adds <code>cin</code> / <code>cout</code>: no format specifiers and no <code>&amp;</code>. Everything else you learned (types, if, loops) is identical.</p>',
    code: R`
#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;                   //> {>>} reads from the keyboard into a, then into b. No {&} and no {%d} needed.
    cout << "sum = " << a + b << endl; //> {<<} sends each piece to the screen in order. {endl} ends the line.
    cout << "avg = " << (a + b) / 2.0 << endl; //> Dividing by {2.0} (a double) gives an exact answer.
    return 0;
}` });

  // ------------------------------------------------------------ problems
  P({ id: 'bs-add', group: 'basics:A', title: 'Add two integers', level: 'easy', input: '12 5', lc: { n: 2235, slug: 'add-two-integers' },
    prompt: '<p>Return the sum of two integers. This is the simplest LeetCode problem, and a good way to learn the <b>function format</b> LeetCode uses.</p>',
    idea: '<p>LeetCode gives you a function to fill in and calls it itself. To run it on your computer, add a <code>main()</code> that reads the input, calls the function, and prints the result. <b>Only the function is submitted.</b></p>',
    code: R`
#include <stdio.h>

int sum(int num1, int num2) {    //> The function LeetCode asks for: two ints in, one int out.
    return num1 + num2;          //> {return} sends the value back to whoever called it.
}

int main() {                     //> This main is just for testing on your own machine. LeetCode has its own.
    int a, b;
    scanf("%d %d", &a, &b);
    printf("%d\n", sum(a, b));   //> Call {sum}, then print the value it returns.
    return 0;
}` });

  P({ id: 'bs-temp', group: 'basics:A', title: 'Convert the temperature', level: 'easy', input: '36.50', lc: { n: 2469, slug: 'convert-the-temperature' },
    prompt: '<p>Given Celsius, output Kelvin = C + 273.15 and Fahrenheit = C × 1.80 + 32.00.</p>',
    idea: '<p>Decimal numbers need <code>double</code>, read with <code>%lf</code> and printed with <code>%f</code>. <code>%.5f</code> shows 5 digits after the point.</p>',
    code: R`
#include <stdio.h>

int main() {
    double c;                     //> {double} because temperatures have decimals.
    scanf("%lf", &c);             //> {%lf} = “long float”, which scanf needs for a double.
    double kelvin = c + 273.15;
    double fahrenheit = c * 1.80 + 32.00;
    printf("[%.5f, %.5f]\n", kelvin, fahrenheit); //> {%.5f}: exactly 5 decimal places.
    return 0;
}`,
    traps: ['Reading a double with <code>%d</code> or <code>%f</code> in scanf gives garbage. Use <code>%lf</code>.'] });

  P({ id: 'bs-evenodd', group: 'basics:A', title: 'Even or odd', level: 'easy', input: '17', gfg: 'https://www.geeksforgeeks.org/problems/odd-or-even3618/1',
    prompt: '<p>Print whether n is even or odd.</p>',
    idea: '<p><code>n % 2</code> is 0 for even numbers. For negative odd numbers it is <b>−1</b> (not 1), so compare with 0, never with 1.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    if (n % 2 == 0) {           //> Remainder 0 when divided by 2 → even. Comparing with 0 also works for negative numbers.
        printf("even\n");
    } else {
        printf("odd\n");
    }
    return 0;
}`,
    traps: ['Writing <code>if (n % 2 = 0)</code> with one <code>=</code> is an assignment, not a comparison.'] });

  P({ id: 'bs-max3', group: 'basics:A', title: 'Largest of three numbers', level: 'easy', input: '8 21 13', gfg: 'https://www.geeksforgeeks.org/problems/greatest-of-three-numbers2520/1',
    prompt: '<p>Print the largest of a, b, c.</p>',
    idea: '<p>Two clean ways: (1) an if-else ladder with <code>&amp;&amp;</code>, or (2) a <b>running maximum</b>, starting with <code>a</code> and replacing it whenever something bigger appears. The second way scales to any number of values (it is how you find the max of an array).</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, b, c;
    scanf("%d %d %d", &a, &b, &c);
    int best = a;                //> Assume the first one is the largest …
    if (b > best) best = b;      //> … replace it if b is bigger …
    if (c > best) best = c;      //> … and again for c. Each if is checked on its own (not else-if).
    printf("%d\n", best);
    return 0;
}` });

  P({ id: 'bs-smallest-even', group: 'basics:A', title: 'Smallest even multiple', level: 'easy', input: '5', lc: { n: 2413, slug: 'smallest-even-multiple' },
    prompt: '<p>Return the smallest positive number that is a multiple of both 2 and n.</p>',
    idea: '<p>If n is already even, n itself works. Otherwise you need 2n. That is one condition, so the <b>ternary operator</b> fits nicely.</p>',
    code: R`
#include <stdio.h>

int smallestEvenMultiple(int n) {
    return (n % 2 == 0) ? n : 2 * n;   //> {cond ? x : y} → x if cond is true, else y. A one-line if-else that produces a value.
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%d\n", smallestEvenMultiple(n));
    return 0;
}` });

  P({ id: 'bs-double-rev', group: 'basics:A', title: 'A number after a double reversal', level: 'easy', input: '1800', lc: { n: 2119, slug: 'a-number-after-a-double-reversal' },
    prompt: '<p>Reverse num (dropping leading zeros), then reverse the result again. Is it equal to num?</p>',
    idea: '<p>Don’t simulate it, think: reversing loses the <b>trailing zeros</b> (1800 → 81 → 18). So the answer is true exactly when num has no trailing zero, i.e. <code>num % 10 != 0</code>. The exception is 0 itself.</p>',
    code: R`
#include <stdio.h>
#include <stdbool.h>

bool isSameAfterReversals(int num) {
    return num == 0 || num % 10 != 0;   //> 0 stays 0. Otherwise the last digit must not be 0.
}

int main() {
    int n;
    scanf("%d", &n);
    printf(isSameAfterReversals(n) ? "true\n" : "false\n"); //> {? :} picks which string to print.
    return 0;
}` });

  P({ id: 'bs-swap', group: 'basics:A', title: 'Swap two numbers', level: 'easy', input: '3 9', gfg: 'https://www.geeksforgeeks.org/problems/swap-two-numbers3844/1',
    prompt: '<p>Swap a and b, first with a temporary variable, then without one.</p>',
    idea: '<p>Like swapping the drinks in two glasses: you need a third, empty glass (<code>temp</code>). The arithmetic trick saves the variable, but it can overflow, so in real code use <code>temp</code>.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);
    int temp = a;      //> Save a in the empty glass.
    a = b;             //> Now a can be overwritten.
    b = temp;          //> Put the saved value into b.
    printf("after swap 1: a=%d b=%d\n", a, b);
    a = a + b;         //> Without temp: a holds the total …
    b = a - b;         //> … total − old b = old a …
    a = a - b;         //> … total − old a = old b.
    printf("after swap 2: a=%d b=%d\n", a, b);
    return 0;
}`,
    traps: ['Writing <code>a = b; b = a;</code> makes both equal to the old b, because the old a is already lost.'] });

  P({ id: 'bs-grade', group: 'basics:A', title: 'Leap year', level: 'easy', input: '1900', gfg: 'https://www.geeksforgeeks.org/problems/leap-year0943/1',
    prompt: '<p>Is the year a leap year? 1900 is not, 2000 is, 2024 is.</p>',
    idea: '<p>Write the rule as an <b>else-if ladder from the most specific case to the most general</b>: divisible by 400 → leap, else by 100 → not leap, else by 4 → leap, else not. Compare it with the single <code>&amp;&amp; / ||</code> expression in the notes.</p>',
    code: R`
#include <stdio.h>

int main() {
    int y;
    scanf("%d", &y);
    if (y % 400 == 0) {            //> 2000, 2400 … are leap years.
        printf("leap\n");
    } else if (y % 100 == 0) {     //> 1900, 2100 … are <b>not</b> (century years).
        printf("not leap\n");
    } else if (y % 4 == 0) {       //> Every other year divisible by 4 is a leap year.
        printf("leap\n");
    } else {
        printf("not leap\n");
    }
    return 0;
}` });

  P({ id: 'bs-calc', group: 'basics:A', title: 'Simple calculator with switch', level: 'easy', input: '12 * 4',
    prompt: '<p>Read <code>a op b</code> (op is one of + − * /) and print the result.</p>',
    idea: '<p>The operator is a <code>char</code>, and chars are numbers, so <code>switch</code> can test them directly with <code>case \'+\'</code>. Guard against dividing by zero.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a, b;
    char op;
    scanf("%d %c %d", &a, &op, &b);   //> {%c} reads one character. The space before it skips the space you typed.
    switch (op) {
        case '+': printf("%d\n", a + b); break;
        case '-': printf("%d\n", a - b); break;
        case '*': printf("%d\n", a * b); break;
        case '/':
            if (b == 0) printf("cannot divide by zero\n"); //> Dividing by 0 crashes the program, so check first.
            else printf("%d\n", a / b);
            break;
        default: printf("unknown operator\n");
    }
    return 0;
}` });

  P({ id: 'bs-vowel', group: 'basics:A', title: 'Vowel or consonant (switch fall-through)', level: 'easy', input: 'e', gfg: 'https://www.geeksforgeeks.org/problems/vowel-or-not0831/1',
    prompt: '<p>Read a lowercase letter and say whether it is a vowel.</p>',
    idea: '<p>Five cases share the same answer. Stack them with no <code>break</code> between them, so they <b>fall through</b> into one shared body.</p>',
    code: R`
#include <stdio.h>

int main() {
    char ch;
    scanf(" %c", &ch);
    switch (ch) {
        case 'a':
        case 'e':
        case 'i':
        case 'o':
        case 'u':                    //> All five labels lead to the same printf (they fall through).
            printf("vowel\n");
            break;
        default:
            printf("consonant\n");
    }
    return 0;
}` });
})();
