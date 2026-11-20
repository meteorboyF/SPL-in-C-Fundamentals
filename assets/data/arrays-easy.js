// Arrays — notes examples + easy problems (Striver A2Z step 3.1).
// Input format for most problems: n, then the n numbers (then any extra values).
(function () {
  const P = CN.add, R = String.raw;

  // ------------------------------------------------------------ examples for the notes
  P({ id: 'ex-arr-basics', example: true, title: 'Declare, fill, read and sum an array',
    prompt: '<p>Open the <b>Arrays</b> tab. Each box is one element. The variable used as the index (<code>i</code>) is drawn as a pointer under the box it points to. A box turns blue when it is read and yellow when it is written.</p>',
    code: R`
#include <stdio.h>

int main() {
    int a[5] = {4, 8, 15, 16, 23};   //> 5 ints side by side in memory. Indices go from 0 to 4, never 5.
    int sum = 0;
    for (int i = 0; i < 5; i++) {
        sum += a[i];                 //> Read the element at index {i}.
    }
    a[2] = 99;                       //> Overwrite one element: arrays are mutable.
    printf("sum = %d, a[2] = %d\n", sum, a[2]);
    return 0;
}` });

  P({ id: 'ex-arr-input', example: true, title: 'Reading n numbers into an array', input: '5 7 2 9 4 6',
    prompt: '<p>The usual input format: first the count <code>n</code>, then the n values. Change the input and re-run.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int a[n];                        //> A variable-length array with exactly n slots.
    for (int i = 0; i < n; i++) {
        scanf("%d", &a[i]);          //> {&a[i]} is the address of slot i, so scanf writes straight into it.
    }
    for (int i = n - 1; i >= 0; i--) {
        printf("%d ", a[i]);         //> Print them back in reverse order.
    }
    printf("\n");
    return 0;
}` });

  P({ id: 'ex-arr-func', example: true, title: 'Passing an array to a function',
    prompt: '<p>Arrays are <b>not copied</b> when passed to a function. The function receives the address of the first element, so changes made inside are visible to the caller. Look at the frames: <code>arr</code> in <code>doubleAll</code> refers to <code>a</code> in <code>main</code>.</p>',
    code: R`
#include <stdio.h>

void doubleAll(int arr[], int n) {    //> {int arr[]} receives the address of the caller’s array. The size must be passed separately.
    for (int i = 0; i < n; i++) {
        arr[i] = arr[i] * 2;          //> Writes go straight into main’s array.
    }
}

int main() {
    int a[4] = {1, 2, 3, 4};
    doubleAll(a, 4);
    printf("%d %d %d %d\n", a[0], a[1], a[2], a[3]);
    return 0;
}`,
    traps: ['Inside the function, <code>sizeof(arr)</code> is the size of a pointer (8), not of the array. That is why n is passed in.'] });

  P({ id: 'ex-vector', example: true, title: 'C++ vector: an array that can grow',
    prompt: '<p><code>vector&lt;int&gt;</code> is what LeetCode uses. It knows its own <code>size()</code>, can <code>push_back</code> new elements, and can be passed by reference with <code>&amp;</code>.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> v;                    //> An empty vector: size 0.
    v.push_back(10);                  //> Append at the end: size 1.
    v.push_back(20);
    v.push_back(30);
    v[1] = 25;                        //> Index it exactly like an array.
    for (int x : v) cout << x << " "; //> Range-for: x takes each element in turn.
    cout << "| size " << v.size() << endl;
    v.pop_back();                     //> Remove the last element.
    vector<int> w(4, 7);              //> 4 elements, all 7.
    cout << w.size() << " " << w[3] << " " << v.back() << endl;
    return 0;
}` });

  P({ id: 'ex-2d', example: true, title: '2D arrays: row-wise vs column-wise traversal',
    prompt: '<p>A 2D array is a table: <code>a[row][col]</code>. Watch the <b>crosshair</b> in the Arrays tab: the outer loop variable picks the row, the inner one moves along it. Then tick <b>memory layout</b>: rows are stored one after another (row-major).</p>',
    code: R`
#include <stdio.h>

int main() {
    int a[3][4] = {{1, 2, 3, 4}, {5, 6, 7, 8}, {9, 10, 11, 12}}; //> 3 rows × 4 columns, written row by row.
    int rowSum[3] = {0}, colSum[4] = {0};                         //> {= {0}} sets every element to 0.
    for (int i = 0; i < 3; i++) {                                 //> Row by row …
        for (int j = 0; j < 4; j++) {                             //> … and inside a row, column by column.
            rowSum[i] += a[i][j];
            colSum[j] += a[i][j];
        }
    }
    printf("row sums: %d %d %d\n", rowSum[0], rowSum[1], rowSum[2]);
    printf("col sums: %d %d %d %d\n", colSum[0], colSum[1], colSum[2], colSum[3]);
    return 0;
}` });

  P({ id: 'ex-3d', example: true, title: '3D arrays (and any K dimensions)',
    prompt: '<p><code>int a[2][3][4]</code> is 2 <b>layers</b>, each a 3 × 4 table. The Arrays tab draws one slice per layer. In memory it is still one straight line: tick <b>memory layout</b> and look at the address formula. Each index skips over a “stride” of elements (12, 4, 1 here).</p>',
    code: R`
#include <stdio.h>

int main() {
    int a[2][3][4];                       //> 2 × 3 × 4 = 24 ints in one contiguous block.
    int val = 1;
    for (int k = 0; k < 2; k++)           //> layer
        for (int i = 0; i < 3; i++)       //> row in that layer
            for (int j = 0; j < 4; j++)   //> column in that row
                a[k][i][j] = val++;       //> Fill in memory order: 1, 2, 3 …
    printf("a[1][2][3] = %d\n", a[1][2][3]);
    printf("elements = %d\n", (int)(sizeof(a) / sizeof(a[0][0][0]))); //> Total bytes ÷ bytes per element.
    return 0;
}` });

  // ------------------------------------------------------------ A. easy
  P({ id: 'ar-largest', group: 'arr:A', title: 'Largest element in an array', level: 'easy', input: '6 3 8 1 9 4 2', tests: ['1 5', '4 -3 -8 -1 -9'], gfg: 'https://www.geeksforgeeks.org/problems/largest-element-in-array4009/1',
    prompt: '<p>Return the largest element.</p>',
    idea: '<p>The <b>running maximum</b>. Start with <code>a[0]</code> (not 0: every element might be negative) and replace it whenever you see something bigger. One pass, O(n).</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int best = a[0];                     //> Start with the first element, which is a real value from the array.
    for (int i = 1; i < n; i++) {
        if (a[i] > best) best = a[i];    //> Found something bigger → it becomes the new best.
    }
    printf("%d\n", best);
    return 0;
}`,
    complexity: 'O(n) time, O(1) space. Sorting first would be O(n log n), which is slower for no benefit.',
    traps: ['<code>int best = 0;</code> gives the wrong answer for an all-negative array.'] });

  P({ id: 'ar-second', group: 'arr:A', title: 'Second largest element (one pass)', level: 'easy', input: '6 12 35 1 10 34 1', tests: ['3 10 10 10', '4 5 5 3 2'], gfg: 'https://www.geeksforgeeks.org/problems/second-largest3735/1',
    prompt: '<p>Return the second largest <b>distinct</b> element, or −1 if there is none.</p>',
    idea: '<p>Keep two values, <code>first</code> and <code>second</code>. A new maximum pushes the old maximum down to second place. A value strictly between them becomes the new second. Equal values are ignored, so duplicates of the maximum don’t count.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int getSecondLargest(vector<int>& arr) {
    int first = -1, second = -1;              //> −1 means “not found yet” (all inputs are non-negative here).
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] > first) {
            second = first;                   //> The old champion becomes runner-up …
            first = arr[i];                   //> … and the new value is the champion.
        } else if (arr[i] < first && arr[i] > second) {
            second = arr[i];                  //> Between the two → new runner-up. ({arr[i] < first} skips duplicates of the max.)
        }
    }
    return second;
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << getSecondLargest(arr) << endl;
    return 0;
}`,
    complexity: 'O(n), one pass.' });

  P({ id: 'ar-is-sorted', group: 'arr:A', title: 'Check if an array is sorted', level: 'easy', input: '5 1 2 2 4 7', tests: ['4 1 3 2 4'], gfg: 'https://www.geeksforgeeks.org/problems/check-if-an-array-is-sorted0701/1',
    prompt: '<p>Is the array in non-decreasing order?</p>',
    idea: '<p>Sorted means <b>every neighbouring pair</b> is in order. Compare <code>a[i-1]</code> with <code>a[i]</code>, and stop at the first pair that is out of order.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int sorted = 1;
    for (int i = 1; i < n; i++) {
        if (a[i - 1] > a[i]) {          //> A pair out of order → not sorted.
            sorted = 0;
            break;                      //> No need to look further.
        }
    }
    printf(sorted ? "sorted\n" : "not sorted\n");
    return 0;
}` });

  P({ id: 'ar-sorted-rot', group: 'arr:A', title: 'Check if array is sorted and rotated', level: 'easy', input: '5 3 4 5 1 2', tests: ['4 2 1 3 4', '3 1 2 3'], lc: { n: 1752, slug: 'check-if-array-is-sorted-and-rotated' },
    prompt: '<p>Was the array sorted and then rotated some number of times?</p>',
    idea: '<p>A sorted array that has been rotated has <b>at most one “drop”</b> (a place where <code>nums[i] &gt; nums[i+1]</code>) when you also compare the last element with the first (wrap around with <code>% n</code>).</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

bool check(vector<int>& nums) {
    int n = nums.size(), drops = 0;
    for (int i = 0; i < n; i++) {
        if (nums[i] > nums[(i + 1) % n]) drops++;   //> {(i + 1) % n} wraps the last index back to 0.
    }
    return drops <= 1;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << (check(nums) ? "true" : "false") << endl;
    return 0;
}` });

  P({ id: 'ar-rm-dup', group: 'arr:A', title: 'Remove duplicates from sorted array', level: 'easy', input: '7 0 0 1 1 1 2 3', tests: ['3 1 1 2'], lc: { n: 26, slug: 'remove-duplicates-from-sorted-array' }, range: ['k', 'i'],
    prompt: '<p>Remove duplicates <b>in place</b> so each value appears once in the first k slots. Return k.</p>',
    idea: '<p><b>Two pointers.</b> <code>k</code> marks the end of the unique part, and <code>i</code> scans ahead. Because the array is sorted, a new value is simply one that differs from the last unique value <code>nums[k-1]</code>. Copy it to <code>nums[k]</code> and grow k. Watch the two pointers move in the Arrays tab.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int removeDuplicates(vector<int>& nums) {
    int k = 1;                                //> nums[0] is always unique, so the unique part is nums[0 .. k−1].
    for (int i = 1; i < nums.size(); i++) {
        if (nums[i] != nums[k - 1]) {         //> Different from the last unique value → a new value.
            nums[k] = nums[i];                //> Write it right after the unique part …
            k++;                              //> … and extend that part.
        }
    }
    return k;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    int k = removeDuplicates(nums);
    for (int i = 0; i < k; i++) cout << nums[i] << " ";
    cout << "(k = " << k << ")" << endl;
    return 0;
}`,
    complexity: 'O(n) time, O(1) extra space.' });

  P({ id: 'ar-rot1', group: 'arr:A', title: 'Left rotate an array by one', level: 'easy', input: '5 1 2 3 4 5', gfg: 'https://www.geeksforgeeks.org/problems/cyclically-rotate-an-array-by-one2614/1',
    prompt: '<p>Move every element one place left; the first element goes to the end.</p>',
    idea: '<p>Save <code>a[0]</code> (it would be overwritten), shift everyone left with <code>a[i-1] = a[i]</code>, then put the saved value at the end.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int first = a[0];                  //> Save it before it is overwritten.
    for (int i = 1; i < n; i++) {
        a[i - 1] = a[i];               //> Shift one step to the left.
    }
    a[n - 1] = first;                  //> The old first element goes to the back.
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\n");
    return 0;
}` });

  P({ id: 'ar-rotk', group: 'arr:A', title: 'Rotate array by k (reversal algorithm)', level: 'medium', input: '7 1 2 3 4 5 6 7 3', tests: ['2 -1 -100 5'], lc: { n: 189, slug: 'rotate-array' }, range: ['l', 'r'],
    prompt: '<p>Rotate the array to the <b>right</b> by k steps, in place.</p>',
    idea: '<p>Rotating right by k moves the last k elements to the front. Three reversals do it with O(1) space: reverse the <b>whole</b> array, then reverse the first k, then reverse the rest. Example 1234567, k = 3: 7654321 → 567 4321 → 567 1234. (Use <code>k %= n</code> first, because rotating by n changes nothing.)</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

void rev(vector<int>& a, int l, int r) {      //> Reverse a[l..r] with two pointers moving inwards.
    while (l < r) {
        swap(a[l], a[r]);
        l++;
        r--;
    }
}

void rotate(vector<int>& nums, int k) {
    int n = nums.size();
    k = k % n;                                 //> Rotating by n is a full circle.
    rev(nums, 0, n - 1);                       //> 1) reverse everything
    rev(nums, 0, k - 1);                       //> 2) reverse the first k
    rev(nums, k, n - 1);                       //> 3) reverse the rest
}

int main() {
    int n, k;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cin >> k;
    rotate(nums, k);
    for (int x : nums) cout << x << " ";
    cout << endl;
    return 0;
}`,
    complexity: 'O(n) time (each element is swapped about twice), O(1) space.' });

  P({ id: 'ar-zeros', group: 'arr:A', title: 'Move zeroes to the end', level: 'easy', input: '6 0 1 0 3 12 0', lc: { n: 283, slug: 'move-zeroes' },
    prompt: '<p>Move all 0s to the end, keeping the order of the other elements, in place.</p>',
    idea: '<p>Two pointers again: <code>j</code> is where the next non-zero belongs. Scan with <code>i</code>, and every non-zero is <b>swapped</b> into position j. The zeros drift to the back by themselves.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

void moveZeroes(vector<int>& nums) {
    int j = 0;                               //> Next slot for a non-zero value.
    for (int i = 0; i < nums.size(); i++) {
        if (nums[i] != 0) {
            swap(nums[i], nums[j]);          //> Bring the non-zero forward; a zero (if any) goes back to i.
            j++;
        }
    }
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    moveZeroes(nums);
    for (int x : nums) cout << x << " ";
    cout << endl;
    return 0;
}` });

  P({ id: 'ar-linear', group: 'arr:A', title: 'Linear search', level: 'easy', input: '6 4 7 1 9 7 3 7', tests: ['3 1 2 3 8'], gfg: 'https://www.geeksforgeeks.org/problems/search-an-element-in-an-array-1587115621/1',
    prompt: '<p>Read n numbers and a key. Print the index of the first occurrence of the key, or −1.</p>',
    idea: '<p>Check each element from left to right and stop at the first match. If the loop finishes without a match, the key is not there.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n, key;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    scanf("%d", &key);
    int pos = -1;                         //> −1 = not found (no real index is negative).
    for (int i = 0; i < n; i++) {
        if (a[i] == key) {
            pos = i;
            break;                        //> The first occurrence is enough.
        }
    }
    printf("%d\n", pos);
    return 0;
}`,
    complexity: 'O(n). On a sorted array, binary search does it in O(log n).' });

  P({ id: 'ar-union', group: 'arr:A', title: 'Union of two sorted arrays', level: 'medium', input: '5 1 2 3 4 5 5 2 3 4 4 6', gfg: 'https://www.geeksforgeeks.org/problems/union-of-two-sorted-arrays-1587115621/1',
    prompt: '<p>Given two sorted arrays, return their union (every distinct value, sorted).</p>',
    idea: '<p>The <b>merge</b> step of merge sort: one pointer per array, always take the smaller front element. Skip a value if it equals the last one added (<code>u.back()</code>), so duplicates appear only once.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<int> findUnion(vector<int>& a, vector<int>& b) {
    vector<int> u;
    int i = 0, j = 0;
    while (i < a.size() && j < b.size()) {
        int x;
        if (a[i] <= b[j]) { x = a[i]; i++; }    //> Take the smaller front element …
        else { x = b[j]; j++; }
        if (u.empty() || u.back() != x) u.push_back(x); //> … unless it is the same as the last one added.
    }
    while (i < a.size()) { if (u.back() != a[i]) u.push_back(a[i]); i++; } //> Leftovers of a.
    while (j < b.size()) { if (u.back() != b[j]) u.push_back(b[j]); j++; } //> Leftovers of b.
    return u;
}

int main() {
    int n, m;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    cin >> m;
    vector<int> b(m);
    for (int i = 0; i < m; i++) cin >> b[i];
    vector<int> u = findUnion(a, b);
    for (int x : u) cout << x << " ";
    cout << endl;
    return 0;
}`,
    complexity: 'O(n + m) time.' });

  P({ id: 'ar-inter', group: 'arr:A', title: 'Intersection of two sorted arrays', level: 'easy', input: '6 1 2 2 3 3 4 4 2 3 3 5', gfg: 'https://www.geeksforgeeks.org/problems/intersection-of-two-sorted-array-1587115620/1',
    prompt: '<p>Return the elements present in both arrays (as many times as they appear in both).</p>',
    idea: '<p>Two pointers, moving the one with the <b>smaller</b> value (it can’t match anything further on in the other array). On equal values, record the value and move both.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    cin >> m;
    vector<int> b(m);
    for (int i = 0; i < m; i++) cin >> b[i];
    vector<int> common;
    int i = 0, j = 0;
    while (i < n && j < m) {
        if (a[i] < b[j]) i++;                 //> a[i] is too small to appear in b from here on.
        else if (a[i] > b[j]) j++;
        else { common.push_back(a[i]); i++; j++; } //> A match: record it and use up one copy from each array.
    }
    for (int x : common) cout << x << " ";
    cout << endl;
    return 0;
}` });

  P({ id: 'ar-missing', group: 'arr:A', title: 'Missing number', level: 'easy', input: '5 3 0 1 5 2', tests: ['2 0 1'], lc: { n: 268, slug: 'missing-number' },
    prompt: '<p>The array has n distinct numbers from 0…n. Exactly one is missing; find it.</p>',
    idea: '<p>The numbers 0…n add up to <code>n(n+1)/2</code>. Subtract the actual sum and what is left is the missing number. (The XOR trick does the same without any risk of overflow: <code>x ^ x = 0</code>.)</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int missingNumber(vector<int>& nums) {
    int n = nums.size();
    int expected = n * (n + 1) / 2;    //> Sum of 0 + 1 + … + n.
    int actual = 0;
    for (int x : nums) actual += x;
    return expected - actual;          //> The difference is the number that was never added.
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << missingNumber(nums) << endl;
    return 0;
}`,
    tryit: ['XOR version: <code>x = n; for i: x ^= i ^ nums[i];</code>. Every number that appears twice cancels out.'] });

  P({ id: 'ar-ones', group: 'arr:A', title: 'Max consecutive ones', level: 'easy', input: '6 1 1 0 1 1 1', lc: { n: 485, slug: 'max-consecutive-ones' },
    prompt: '<p>Find the longest run of 1s in a binary array.</p>',
    idea: '<p>Keep a <b>current streak</b> counter that grows on a 1 and resets on a 0, and a <b>best</b> that remembers the longest streak seen.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int findMaxConsecutiveOnes(vector<int>& nums) {
    int cur = 0, best = 0;
    for (int x : nums) {
        if (x == 1) {
            cur++;                      //> The streak continues.
            best = max(best, cur);
        } else {
            cur = 0;                    //> A zero breaks the streak.
        }
    }
    return best;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << findMaxConsecutiveOnes(nums) << endl;
    return 0;
}` });

  P({ id: 'ar-single', group: 'arr:A', title: 'Single number (XOR)', level: 'easy', input: '5 4 1 2 1 2', lc: { n: 136, slug: 'single-number' },
    prompt: '<p>Every element appears twice except one. Find it in O(n) time and O(1) space.</p>',
    idea: '<p>XOR has two useful properties: <code>x ^ x = 0</code> and <code>x ^ 0 = x</code>, and the order doesn’t matter. XOR everything together: each pair cancels to 0, and only the single number survives.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int singleNumber(vector<int>& nums) {
    int x = 0;
    for (int v : nums) x ^= v;          //> Pairs cancel out (a ^ a = 0), so the unpaired value is left.
    return x;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << singleNumber(nums) << endl;
    return 0;
}` });

  P({ id: 'ar-reverse', group: 'arr:A', title: 'Reverse an array in place', level: 'easy', input: '6 1 2 3 4 5 6', tests: ['5 1 2 3 4 5'], range: ['l', 'r'], gfg: 'https://www.geeksforgeeks.org/problems/reverse-an-array/1',
    prompt: '<p>Reverse the array without using a second array.</p>',
    idea: '<p>Two pointers from <b>both ends</b>: swap <code>a[l]</code> and <code>a[r]</code>, then move them towards each other. Stop when they meet. With an odd length, the middle element stays where it is.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int l = 0, r = n - 1;
    while (l < r) {                 //> Stop when the pointers meet or cross.
        int t = a[l];
        a[l] = a[r];                //> Swap the two ends …
        a[r] = t;
        l++;                        //> … and move inwards.
        r--;
    }
    for (int i = 0; i < n; i++) printf("%d ", a[i]);
    printf("\n");
    return 0;
}`,
    complexity: 'n/2 swaps → O(n).' });

  P({ id: 'ar-running', group: 'arr:A', title: 'Running sum (prefix sums)', level: 'easy', input: '5 3 1 2 10 1', lc: { n: 1480, slug: 'running-sum-of-1d-array' },
    prompt: '<p>Return runningSum[i] = nums[0] + … + nums[i].</p>',
    idea: '<p>Each prefix sum is <b>the previous prefix sum plus one element</b>: <code>nums[i] += nums[i-1]</code>, done in place. Prefix sums are behind many medium problems: any range sum becomes <code>pre[r] − pre[l−1]</code>.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<int> runningSum(vector<int>& nums) {
    for (int i = 1; i < nums.size(); i++) {
        nums[i] += nums[i - 1];          //> nums[i−1] already holds the sum up to i−1.
    }
    return nums;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    vector<int> ans = runningSum(nums);
    for (int x : ans) cout << x << " ";
    cout << endl;
    return 0;
}` });

  P({ id: 'ar-pivot', group: 'arr:A', title: 'Find pivot index', level: 'easy', input: '6 1 7 3 6 5 6', tests: ['3 1 2 3', '3 2 1 -1'], lc: { n: 724, slug: 'find-pivot-index' },
    prompt: '<p>Return the leftmost index where the sum of the elements to its left equals the sum of the elements to its right.</p>',
    idea: '<p>Compute the total once. Walk left to right keeping <code>left</code> (the sum before i). Then the right side is <code>total − left − nums[i]</code>, so no inner loop is needed.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int pivotIndex(vector<int>& nums) {
    int total = 0;
    for (int x : nums) total += x;
    int left = 0;
    for (int i = 0; i < nums.size(); i++) {
        int right = total - left - nums[i];  //> Everything except the left part and the element itself.
        if (left == right) return i;
        left += nums[i];                      //> Move nums[i] into the left part.
    }
    return -1;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << pivotIndex(nums) << endl;
    return 0;
}`,
    complexity: 'O(n) instead of O(n²).' });

  P({ id: 'ar-freq', group: 'arr:A', title: 'Count frequencies with a counting array', level: 'easy', input: '8 2 3 2 5 3 2 0 5',
    prompt: '<p>Values are between 0 and 9. Print how many times each value appears.</p>',
    idea: '<p><b>Hashing with an array</b>: when values are small, use the value itself as an index into a counter array, <code>cnt[value]++</code>. Each lookup is O(1). This is the simplest hash table.</p>',
    code: R`
#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);
    int a[n];
    for (int i = 0; i < n; i++) scanf("%d", &a[i]);
    int cnt[10] = {0};                      //> One counter per possible value 0 … 9.
    for (int i = 0; i < n; i++) {
        cnt[a[i]]++;                        //> The value is the index: a[i] = 2 → cnt[2]++.
    }
    for (int v = 0; v < 10; v++) {
        if (cnt[v] > 0) printf("%d appears %d time(s)\n", v, cnt[v]);
    }
    return 0;
}`,
    tryit: ['For large or negative values, an array is not possible. Use <code>unordered_map&lt;int,int&gt;</code> instead (see Two Sum).'] });

  P({ id: 'ar-shuffle', group: 'arr:A', title: 'Shuffle the array', level: 'easy', input: '6 2 5 1 3 4 7 3', lc: { n: 1470, slug: 'shuffle-the-array' },
    prompt: '<p>nums = [x1, …, xn, y1, …, yn]. Return [x1, y1, x2, y2, …].</p>',
    idea: '<p>Index arithmetic: <code>x_i</code> is at <code>i</code> and <code>y_i</code> is at <code>i + n</code>. Build the answer by pushing those two each time.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<int> shuffle(vector<int>& nums, int n) {
    vector<int> ans;
    for (int i = 0; i < n; i++) {
        ans.push_back(nums[i]);         //> x_i
        ans.push_back(nums[i + n]);     //> y_i is exactly n places later.
    }
    return ans;
}

int main() {
    int len, n;
    cin >> len;
    vector<int> nums(len);
    for (int i = 0; i < len; i++) cin >> nums[i];
    cin >> n;
    vector<int> ans = shuffle(nums, n);
    for (int x : ans) cout << x << " ";
    cout << endl;
    return 0;
}` });

  P({ id: 'ar-longest-k-pos', group: 'arr:A', title: 'Longest subarray with sum K (positives)', level: 'medium', input: '7 1 2 3 1 1 1 1 3', tests: ['5 2 3 5 1 9 10'], range: ['l', 'r'], gfg: 'https://www.geeksforgeeks.org/problems/longest-sub-array-with-sum-k0809/1',
    prompt: '<p>All elements are positive. Find the length of the longest subarray (contiguous) whose sum is K.</p>',
    idea: '<p>A <b>sliding window</b> <code>[l..r]</code>. Grow it by moving r. If the sum gets too big, shrink it from the left by moving l. This only works because all numbers are positive: adding always increases the sum and removing always decreases it. The shaded range in the Arrays tab is the window.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    cin >> k;
    int l = 0, sum = 0, best = 0;
    for (int r = 0; r < n; r++) {
        sum += a[r];                         //> Grow the window to the right.
        while (sum > k && l <= r) {          //> Too big → drop elements from the left.
            sum -= a[l];
            l++;
        }
        if (sum == k) best = max(best, r - l + 1); //> The window [l..r] has length r − l + 1.
    }
    cout << best << endl;
    return 0;
}`,
    complexity: 'O(n): l and r each move at most n times in total.' });

  P({ id: 'ar-longest-k', group: 'arr:A', title: 'Longest subarray with sum K (negatives allowed)', level: 'medium', input: '6 1 -1 5 -2 3 2 3', tests: ['3 -1 2 3 6'], gfg: 'https://www.geeksforgeeks.org/problems/longest-sub-array-with-sum-k0809/1',
    prompt: '<p>Same question, but now elements can be negative or zero, so the sliding window no longer works.</p>',
    idea: '<p><b>Prefix sums + hash map.</b> If the prefix sum up to r is <code>pre</code> and some earlier prefix sum was <code>pre − k</code> (at index i), then the subarray after i sums to exactly k. Store the <b>first</b> index of every prefix sum in a map. Keeping the first index gives the longest subarray.</p>',
    formula: [['sum(i+1 .. r)', '=', 'pre[r] − pre[i]', '= k  ⇔  pre[i] = pre[r] − k']],
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    cin >> k;
    map<int, int> first;                     //> prefix sum → first index where it occurred.
    int pre = 0, best = 0;
    for (int r = 0; r < n; r++) {
        pre += a[r];
        if (pre == k) best = r + 1;          //> The whole prefix a[0..r] works.
        if (first.count(pre - k)) best = max(best, r - first[pre - k]); //> A subarray ends at r, starting right after that earlier index.
        if (!first.count(pre)) first[pre] = r;   //> Only store the first time, to keep subarrays as long as possible.
    }
    cout << best << endl;
    return 0;
}`,
    complexity: 'O(n log n) with map (O(n) average with unordered_map), O(n) space.' });
})();
