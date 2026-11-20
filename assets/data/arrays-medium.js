// Arrays — medium (B) and hard (C) problems, Striver A2Z step 3.2 / 3.3.
(function () {
  const P = CN.add, R = String.raw;

  // ------------------------------------------------------------ B. medium
  P({ id: 'ar-two-sum', group: 'arr:B', title: 'Two Sum', level: 'easy', input: '4 2 7 11 15 9', tests: ['3 3 2 4 6', '2 3 3 6'], lc: { n: 1, slug: 'two-sum' },
    prompt: '<p>Return the indices of the two numbers that add up to target.</p>',
    idea: '<p>For each number x you need its <b>complement</b> <code>target − x</code>. Instead of searching for it (O(n) each, O(n²) total), remember every number you have passed in a hash map <code>value → index</code>, so “have I seen the complement?” is O(1). Check <b>before</b> inserting x, so an element is never paired with itself.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    unordered_map<int, int> seen;                 //> value → index, for everything to the left of i.
    for (int i = 0; i < nums.size(); i++) {
        int need = target - nums[i];              //> The partner that would complete the sum.
        if (seen.find(need) != seen.end()) {      //> Seen it already? {find} returns {end()} when the key is missing.
            return {seen[need], i};               //> Build and return a 2-element vector.
        }
        seen[nums[i]] = i;                        //> Remember this value for later elements.
    }
    return {};
}

int main() {
    int n, target;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cin >> target;
    vector<int> ans = twoSum(nums, target);
    cout << ans[0] << " " << ans[1] << endl;
    return 0;
}`,
    complexity: 'O(n) time and O(n) space, instead of O(n²) for the double loop.',
    tryit: ['The other version of this problem (“just say yes/no”) can sort the array and use two pointers from both ends: O(n log n), O(1) space.'] });

  P({ id: 'ar-colors', group: 'arr:B', title: "Sort colors (0s, 1s, 2s) — Dutch national flag", level: 'medium', input: '6 2 0 2 1 1 0', tests: ['3 2 0 1'], lc: { n: 75, slug: 'sort-colors' }, range: ['mid', 'high'],
    prompt: '<p>Sort an array of 0s, 1s and 2s in one pass, in place.</p>',
    idea: '<p>Three pointers split the array into four zones: <code>[0..low-1]</code> = 0s, <code>[low..mid-1]</code> = 1s, <code>[mid..high]</code> = <b>unknown</b> (shaded), <code>[high+1..]</code> = 2s. Look at <code>nums[mid]</code>: a 0 is swapped to low (both move), a 1 stays (mid moves), a 2 is swapped to high (high moves, but mid doesn’t, because the swapped-in value is still unknown).</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

void sortColors(vector<int>& nums) {
    int low = 0, mid = 0, high = nums.size() - 1;
    while (mid <= high) {                        //> While the unknown zone is not empty.
        if (nums[mid] == 0) {
            swap(nums[low], nums[mid]);          //> Put the 0 at the end of the 0-zone.
            low++;
            mid++;
        } else if (nums[mid] == 1) {
            mid++;                               //> A 1 is already in the right zone.
        } else {
            swap(nums[mid], nums[high]);         //> Send the 2 to the back …
            high--;                              //> … but don’t move mid: the value swapped in hasn’t been looked at yet.
        }
    }
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    sortColors(nums);
    for (int x : nums) cout << x << " ";
    cout << endl;
    return 0;
}`,
    complexity: 'O(n), one pass, O(1) space. (Counting the 0s, 1s and 2s and rewriting is two passes.)' });

  P({ id: 'ar-majority', group: 'arr:B', title: 'Majority element (Moore’s voting)', level: 'easy', input: '7 2 2 1 1 1 2 2', lc: { n: 169, slug: 'majority-element' },
    prompt: '<p>Find the element that appears more than n/2 times (it is guaranteed to exist).</p>',
    idea: '<p>Moore’s voting algorithm: keep a <code>candidate</code> and a <code>count</code>. A matching element is a vote for it, a different one cancels one vote, and at count 0 you pick a new candidate. The majority has more votes than all the others combined, so it can’t be cancelled out completely.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int majorityElement(vector<int>& nums) {
    int candidate = 0, count = 0;
    for (int x : nums) {
        if (count == 0) candidate = x;     //> No votes left → this element becomes the candidate.
        if (x == candidate) count++;       //> A vote for it …
        else count--;                      //> … or one vote cancelled.
    }
    return candidate;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << majorityElement(nums) << endl;
    return 0;
}`,
    complexity: 'O(n) time, O(1) space (a hash-map count would use O(n) space).' });

  P({ id: 'ar-kadane', group: 'arr:B', title: "Maximum subarray sum (Kadane) — and print it", level: 'medium', input: '9 -2 1 -3 4 -1 2 1 -5 4', tests: ['3 -3 -1 -2'], lc: { n: 53, slug: 'maximum-subarray' }, ptrs: ['start', 'ansStart', 'ansEnd'], range: ['ansStart', 'ansEnd'],
    prompt: '<p>Find the contiguous subarray with the largest sum, and print which subarray it is.</p>',
    idea: '<p>Walk left to right with a running <code>sum</code>. If the sum ever goes <b>negative</b>, it can only hurt whatever comes next, so throw it away and start fresh at the next index. Record the best sum and where it started and ended. The shaded range is the best subarray found so far.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    long long sum = 0, best = LLONG_MIN;          //> best starts at “minus infinity”, so all-negative arrays still work.
    int start = 0, ansStart = 0, ansEnd = 0;
    for (int i = 0; i < n; i++) {
        if (sum == 0) start = i;                  //> A fresh subarray starts here.
        sum += nums[i];
        if (sum > best) {                         //> New best: remember its boundaries.
            best = sum;
            ansStart = start;
            ansEnd = i;
        }
        if (sum < 0) sum = 0;                     //> A negative prefix only hurts, so drop it.
    }
    cout << best << " from index " << ansStart << " to " << ansEnd << endl;
    return 0;
}`,
    complexity: 'O(n) time, O(1) space.' });

  P({ id: 'ar-stock', group: 'arr:B', title: 'Best time to buy and sell stock', level: 'easy', input: '6 7 1 5 3 6 4', tests: ['5 7 6 4 3 1'], lc: { n: 121, slug: 'best-time-to-buy-and-sell-stock' }, bars: true,
    prompt: '<p>Buy one day, sell a later day. What is the maximum profit (or 0)?</p>',
    idea: '<p>If you sell on day i, the best buying day is the <b>cheapest day before i</b>. So keep the minimum price seen so far and check <code>price − minPrice</code> each day. The bar chart shows the prices.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int maxProfit(vector<int>& prices) {
    int minPrice = INT_MAX, profit = 0;
    for (int i = 0; i < prices.size(); i++) {
        minPrice = min(minPrice, prices[i]);              //> The cheapest day up to and including today.
        profit = max(profit, prices[i] - minPrice);       //> Selling today after buying at that minimum.
    }
    return profit;
}

int main() {
    int n;
    cin >> n;
    vector<int> prices(n);
    for (int i = 0; i < n; i++) cin >> prices[i];
    cout << maxProfit(prices) << endl;
    return 0;
}` });

  P({ id: 'ar-sign', group: 'arr:B', title: 'Rearrange array elements by sign', level: 'medium', input: '6 3 1 -2 -5 2 -4', lc: { n: 2149, slug: 'rearrange-array-elements-by-sign' },
    prompt: '<p>Equal numbers of positives and negatives. Rearrange to +, −, +, − … keeping the relative order within each sign.</p>',
    idea: '<p>The positives go to the even indices 0, 2, 4 … and the negatives to the odd indices 1, 3, 5 … Keep one write pointer for each and move it forward by 2.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<int> rearrangeArray(vector<int>& nums) {
    vector<int> ans(nums.size());
    int pos = 0, neg = 1;                       //> Next even slot, next odd slot.
    for (int i = 0; i < nums.size(); i++) {
        if (nums[i] > 0) { ans[pos] = nums[i]; pos += 2; }
        else { ans[neg] = nums[i]; neg += 2; }
    }
    return ans;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    vector<int> ans = rearrangeArray(nums);
    for (int x : ans) cout << x << " ";
    cout << endl;
    return 0;
}` });

  P({ id: 'ar-next-perm', group: 'arr:B', title: 'Next permutation', level: 'medium', input: '5 2 1 5 4 3', tests: ['3 1 2 3', '3 3 2 1'], lc: { n: 31, slug: 'next-permutation' },
    prompt: '<p>Rearrange into the next lexicographically greater permutation (or the smallest one if this is the largest).</p>',
    idea: '<ol><li>From the right, find the first index <code>i</code> with <code>nums[i] &lt; nums[i+1]</code> (the “break point”). Everything after it is decreasing, so it is already the largest it can be.</li><li>If there is no break point, this is the last permutation: reverse it all.</li><li>Otherwise swap <code>nums[i]</code> with the <b>smallest value to its right that is bigger than it</b> (scan from the right).</li><li>Reverse the suffix after i, so it becomes as small as possible.</li></ol>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

void nextPermutation(vector<int>& nums) {
    int n = nums.size(), i = n - 2;
    while (i >= 0 && nums[i] >= nums[i + 1]) i--;     //> 1) Break point: the first dip from the right.
    if (i >= 0) {
        int j = n - 1;
        while (nums[j] <= nums[i]) j--;                //> 2) The rightmost value bigger than nums[i] (the smallest such, since the suffix is decreasing).
        swap(nums[i], nums[j]);
    }
    reverse(nums.begin() + i + 1, nums.end());         //> 3) Make the suffix as small as possible. If i = −1, this reverses everything.
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    nextPermutation(nums);
    for (int x : nums) cout << x << " ";
    cout << endl;
    return 0;
}`,
    complexity: 'O(n), O(1) space.' });

  P({ id: 'ar-leaders', group: 'arr:B', title: 'Leaders in an array', level: 'easy', input: '6 10 22 12 3 0 6', gfg: 'https://www.geeksforgeeks.org/problems/leaders-in-an-array-1587115620/1',
    prompt: '<p>An element is a leader if it is greater than or equal to everything to its right. Print all leaders in order.</p>',
    idea: '<p>Scan from the <b>right</b>, keeping the maximum seen so far. An element at least as big as that maximum is a leader. Because they are collected right to left, reverse at the end.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    vector<int> leaders;
    int maxRight = INT_MIN;
    for (int i = n - 1; i >= 0; i--) {             //> Right to left.
        if (a[i] >= maxRight) {
            leaders.push_back(a[i]);               //> Nothing to its right is bigger.
            maxRight = a[i];
        }
    }
    reverse(leaders.begin(), leaders.end());       //> Back to left-to-right order.
    for (int x : leaders) cout << x << " ";
    cout << endl;
    return 0;
}` });

  P({ id: 'ar-lcs', group: 'arr:B', title: 'Longest consecutive sequence', level: 'medium', input: '6 100 4 200 1 3 2', tests: ['10 0 3 7 2 5 8 4 6 0 1'], lc: { n: 128, slug: 'longest-consecutive-sequence' },
    prompt: '<p>Find the length of the longest run of consecutive integers (in any order) in O(n).</p>',
    idea: '<p>Put everything in a hash set. A number x is the <b>start</b> of a run only if <code>x − 1</code> is not in the set. Only from starts do you count upwards (x+1, x+2 …). Every element is counted in at most one run, so the total work is O(n).</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int longestConsecutive(vector<int>& nums) {
    unordered_set<int> st;
    for (int x : nums) st.insert(x);         //> O(1) average lookups from now on.
    int best = 0;
    for (int x : st) {
        if (st.count(x - 1)) continue;       //> Not the start of a run, so skip it.
        int len = 1;
        while (st.count(x + len)) len++;     //> Walk up the run: x+1, x+2, …
        best = max(best, len);
    }
    return best;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << longestConsecutive(nums) << endl;
    return 0;
}`,
    complexity: 'O(n) average. Sorting first is the simpler O(n log n) way.' });

  P({ id: 'ar-subarray-k', group: 'arr:B', title: 'Subarray sum equals K (count)', level: 'medium', input: '6 1 2 3 -2 2 3 3', tests: ['3 1 1 1 2'], lc: { n: 560, slug: 'subarray-sum-equals-k' },
    prompt: '<p>Count the subarrays whose sum is exactly k (the elements can be negative).</p>',
    idea: '<p>A subarray ending at i sums to k exactly when an earlier prefix sum equals <code>pre − k</code>. Keep a map <b>prefix sum → how many times seen</b>, and add that count at every step. Start with <code>cnt[0] = 1</code>, the empty prefix, so subarrays that start at index 0 are counted too.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int subarraySum(vector<int>& nums, int k) {
    map<int, int> cnt;                   //> prefix sum → number of times it occurred.
    cnt[0] = 1;                          //> The empty prefix.
    int pre = 0, ans = 0;
    for (int x : nums) {
        pre += x;
        if (cnt.count(pre - k)) ans += cnt[pre - k]; //> Every earlier prefix equal to pre − k gives one subarray ending here.
        cnt[pre]++;
    }
    return ans;
}

int main() {
    int n, k;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cin >> k;
    cout << subarraySum(nums, k) << endl;
    return 0;
}`,
    complexity: 'O(n log n) with map, O(n) average with unordered_map.' });

  P({ id: 'ar-pascal', group: 'arr:B', title: "Pascal's triangle", level: 'easy', input: '5', lc: { n: 118, slug: 'pascals-triangle' },
    prompt: '<p>Return the first numRows rows of Pascal’s triangle as a 2D vector.</p>',
    idea: '<p>A <b>jagged</b> 2D vector: row r has r+1 entries. Each row starts and ends with 1, and every inner entry is the sum of the two entries above it: <code>tri[r-1][j-1] + tri[r-1][j]</code>. Watch the rows grow in the Arrays tab.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> generate(int numRows) {
    vector<vector<int>> tri;
    for (int r = 0; r < numRows; r++) {
        vector<int> row(r + 1, 1);                           //> r + 1 entries, all 1 for now.
        for (int j = 1; j < r; j++) {
            row[j] = tri[r - 1][j - 1] + tri[r - 1][j];      //> The two numbers above.
        }
        tri.push_back(row);                                  //> Add the finished row.
    }
    return tri;
}

int main() {
    int n;
    cin >> n;
    vector<vector<int>> t = generate(n);
    for (auto& row : t) {
        for (int x : row) cout << x << " ";
        cout << endl;
    }
    return 0;
}` });

  P({ id: 'ar-range-sum', group: 'arr:B', title: 'Range sum queries with a prefix array', level: 'easy', input: '6 3 -1 4 2 5 -2 3 0 2 1 4 3 5', lc: { n: 303, slug: 'range-sum-query-immutable' },
    prompt: '<p>Answer q queries “sum of a[l..r]” quickly.</p>',
    idea: '<p>Build <code>pre</code> of size n+1, where <code>pre[i]</code> = sum of the first i elements. Then <code>sum(l..r) = pre[r+1] − pre[l]</code>: two lookups per query instead of a loop.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, q;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    vector<int> pre(n + 1, 0);                  //> pre[0] = 0 (the sum of nothing).
    for (int i = 0; i < n; i++) pre[i + 1] = pre[i] + a[i];
    cin >> q;
    while (q > 0) {
        int l, r;
        cin >> l >> r;
        cout << "sum(" << l << ".." << r << ") = " << pre[r + 1] - pre[l] << endl; //> Everything up to r, minus everything before l.
        q--;
    }
    return 0;
}`,
    complexity: 'O(n) to build, then O(1) per query.' });

  // ------------------------------------------------------------ C. hard
  P({ id: 'ar-maj2', group: 'arr:C', title: 'Majority element II (> n/3)', level: 'medium', input: '8 1 1 1 3 3 2 2 2', tests: ['3 3 2 3'], lc: { n: 229, slug: 'majority-element-ii' },
    prompt: '<p>Find all elements appearing more than ⌊n/3⌋ times.</p>',
    idea: '<p>At most <b>two</b> elements can appear more than n/3 times. Run Moore’s voting with two candidates: when an element matches neither, it cancels one vote from both. Then count the candidates again to confirm them.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<int> majorityElement(vector<int>& nums) {
    int c1 = 0, c2 = 0, n1 = INT_MIN, n2 = INT_MIN;
    for (int x : nums) {
        if (x == n1) c1++;
        else if (x == n2) c2++;
        else if (c1 == 0) { n1 = x; c1 = 1; }    //> A free slot → take x as candidate 1.
        else if (c2 == 0) { n2 = x; c2 = 1; }
        else { c1--; c2--; }                     //> x differs from both: cancel one vote from each.
    }
    int k1 = 0, k2 = 0;
    for (int x : nums) { if (x == n1) k1++; else if (x == n2) k2++; } //> Second pass: verify.
    vector<int> ans;
    if (k1 > nums.size() / 3) ans.push_back(n1);
    if (k2 > nums.size() / 3) ans.push_back(n2);
    return ans;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    vector<int> ans = majorityElement(nums);
    for (int x : ans) cout << x << " ";
    cout << endl;
    return 0;
}` });

  P({ id: 'ar-3sum', group: 'arr:C', title: '3Sum', level: 'medium', input: '6 -1 0 1 2 -1 -4', tests: ['3 0 0 0'], lc: { n: 15, slug: '3sum' }, range: ['j', 'k'],
    prompt: '<p>Find all unique triplets that sum to 0.</p>',
    idea: '<p><b>Sort</b>, then fix <code>nums[i]</code> and look for a pair in the rest with two pointers <code>j</code> (left) and <code>k</code> (right). Sum too small → move j right. Too big → move k left. To avoid repeated triplets, skip equal values for i, and after a hit move j past equal values.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> threeSum(vector<int>& nums) {
    sort(nums.begin(), nums.end());                   //> Sorting makes two pointers and duplicate-skipping possible.
    vector<vector<int>> ans;
    int n = nums.size();
    for (int i = 0; i < n; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue; //> Same first value as before → same triplets, so skip.
        int j = i + 1, k = n - 1;
        while (j < k) {
            int sum = nums[i] + nums[j] + nums[k];
            if (sum < 0) j++;                         //> Need a bigger sum.
            else if (sum > 0) k--;                    //> Need a smaller sum.
            else {
                ans.push_back({nums[i], nums[j], nums[k]});
                j++;
                k--;
                while (j < k && nums[j] == nums[j - 1]) j++; //> Skip duplicate second values.
            }
        }
    }
    return ans;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    vector<vector<int>> ans = threeSum(nums);
    for (auto& t : ans) cout << "[" << t[0] << "," << t[1] << "," << t[2] << "] ";
    cout << endl;
    return 0;
}`,
    complexity: 'O(n²) time, O(1) extra space (apart from the answer).' });

  P({ id: 'ar-4sum', group: 'arr:C', title: '4Sum', level: 'medium', input: '6 1 0 -1 0 -2 2 0', lc: { n: 18, slug: '4sum' }, range: ['k', 'l'],
    prompt: '<p>Find all unique quadruplets that sum to target.</p>',
    idea: '<p>3Sum with one more fixed index: two nested loops (i, j) and then two pointers (k, l). The same duplicate-skipping at every level. Use <code>long long</code> for the sum, because four ints can overflow.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> fourSum(vector<int>& nums, int target) {
    sort(nums.begin(), nums.end());
    vector<vector<int>> ans;
    int n = nums.size();
    for (int i = 0; i < n; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        for (int j = i + 1; j < n; j++) {
            if (j > i + 1 && nums[j] == nums[j - 1]) continue;
            int k = j + 1, l = n - 1;
            while (k < l) {
                long long sum = (long long)nums[i] + nums[j] + nums[k] + nums[l]; //> long long: four ints can overflow.
                if (sum < target) k++;
                else if (sum > target) l--;
                else {
                    ans.push_back({nums[i], nums[j], nums[k], nums[l]});
                    k++;
                    l--;
                    while (k < l && nums[k] == nums[k - 1]) k++;
                }
            }
        }
    }
    return ans;
}

int main() {
    int n, target;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cin >> target;
    vector<vector<int>> ans = fourSum(nums, target);
    for (auto& q : ans) cout << "[" << q[0] << "," << q[1] << "," << q[2] << "," << q[3] << "] ";
    cout << endl;
    return 0;
}`,
    complexity: 'O(n³).' });

  P({ id: 'ar-zero-sum', group: 'arr:C', title: 'Largest subarray with 0 sum', level: 'medium', input: '8 15 -2 2 -8 1 7 10 23', gfg: 'https://www.geeksforgeeks.org/problems/largest-subarray-with-0-sum/1',
    prompt: '<p>Find the length of the longest subarray with sum 0.</p>',
    idea: '<p>The same prefix-sum trick with k = 0. If the <b>same prefix sum appears twice</b>, at i and later at j, then the elements between them add up to 0. Store the first index of each prefix sum.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    map<int, int> first;
    int pre = 0, best = 0;
    for (int i = 0; i < n; i++) {
        pre += a[i];
        if (pre == 0) best = i + 1;                       //> The whole prefix sums to 0.
        else if (first.count(pre)) best = max(best, i - first[pre]); //> Seen this sum before → the part in between sums to 0.
        else first[pre] = i;
    }
    cout << best << endl;
    return 0;
}` });

  P({ id: 'ar-xor-k', group: 'arr:C', title: 'Count subarrays with XOR K', level: 'medium', input: '5 4 2 2 6 4 6', tests: ['5 5 6 7 8 9 5'], gfg: 'https://www.interviewbit.com/problems/subarray-with-given-xor/',
    prompt: '<p>Count the subarrays whose XOR is exactly k.</p>',
    idea: '<p>XOR has its own prefix trick: <code>xor(i+1..r) = pre[r] ^ pre[i]</code>. For that to be k, we need <code>pre[i] = pre[r] ^ k</code>. Count earlier prefixes with that value in a map, exactly like “subarray sum equals K”.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, k;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    cin >> k;
    map<int, int> cnt;
    cnt[0] = 1;                            //> The empty prefix has XOR 0.
    int x = 0, ans = 0;
    for (int i = 0; i < n; i++) {
        x ^= a[i];                         //> Prefix XOR up to i.
        int need = x ^ k;                  //> An earlier prefix equal to this makes the part in between XOR to k.
        if (cnt.count(need)) ans += cnt[need];
        cnt[x]++;
    }
    cout << ans << endl;
    return 0;
}` });

  P({ id: 'ar-merge-int', group: 'arr:C', title: 'Merge overlapping intervals', level: 'medium', input: '4 1 3 2 6 8 10 15 18', tests: ['2 1 4 4 5', '3 1 4 0 2 3 5'], lc: { n: 56, slug: 'merge-intervals' },
    prompt: '<p>Merge all overlapping intervals.</p>',
    idea: '<p><b>Sort by start.</b> Then overlapping intervals are next to each other. Compare each interval with the <b>last merged one</b>: if it starts before that one ends, extend the end. Otherwise it begins a new merged interval.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> merge(vector<vector<int>>& iv) {
    sort(iv.begin(), iv.end());                      //> Sorts by start (then by end).
    vector<vector<int>> res;
    for (int i = 0; i < iv.size(); i++) {
        if (res.empty() || iv[i][0] > res.back()[1]) {
            res.push_back(iv[i]);                    //> No overlap with the last merged interval → a new one.
        } else {
            res.back()[1] = max(res.back()[1], iv[i][1]); //> Overlap → stretch the end.
        }
    }
    return res;
}

int main() {
    int n;
    cin >> n;
    vector<vector<int>> iv(n, vector<int>(2));
    for (int i = 0; i < n; i++) cin >> iv[i][0] >> iv[i][1];
    vector<vector<int>> m = merge(iv);
    for (auto& x : m) cout << "[" << x[0] << "," << x[1] << "] ";
    cout << endl;
    return 0;
}`,
    complexity: 'O(n log n) for the sort, then O(n).' });

  P({ id: 'ar-merge-sorted', group: 'arr:C', title: 'Merge sorted array (in place, from the back)', level: 'easy', input: '3 3 1 2 3 2 5 6', tests: ['1 1 4 2'], lc: { n: 88, slug: 'merge-sorted-array' },
    prompt: '<p>nums1 has m elements followed by n empty slots, and nums2 has n elements. Merge nums2 into nums1, sorted.</p>',
    idea: '<p>Merging from the front would overwrite elements of nums1 you still need. Merge from the <b>back</b> instead: the largest of <code>nums1[i]</code> and <code>nums2[j]</code> goes into the last free slot k. The empty slots at the end make room.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
    int i = m - 1, j = n - 1, k = m + n - 1;      //> The last real element of each, and the last slot.
    while (j >= 0) {                               //> When nums2 is used up, the rest of nums1 is already in place.
        if (i >= 0 && nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
        else nums1[k--] = nums2[j--];
    }
}

int main() {
    int m, n;
    cin >> m >> n;
    vector<int> nums1(m + n, 0), nums2(n);
    for (int i = 0; i < m; i++) cin >> nums1[i];
    for (int i = 0; i < n; i++) cin >> nums2[i];
    merge(nums1, m, nums2, n);
    for (int x : nums1) cout << x << " ";
    cout << endl;
    return 0;
}`,
    complexity: 'O(m + n), no extra array.' });

  P({ id: 'ar-miss-rep', group: 'arr:C', title: 'Find the missing and repeating number', level: 'medium', input: '6 4 3 6 2 1 1', gfg: 'https://www.geeksforgeeks.org/problems/find-missing-and-repeating2512/1',
    prompt: '<p>The array should hold 1…n, but one number x appears twice and one number y is missing. Find both.</p>',
    idea: '<p>Two equations. Sum: <code>S − n(n+1)/2 = x − y</code>. Sum of squares: <code>S2 − n(n+1)(2n+1)/6 = x² − y² = (x − y)(x + y)</code>. Divide to get <code>x + y</code>, then solve. Use <code>long long</code>, because the squares get large.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    long long n;
    cin >> n;
    vector<long long> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    long long s = 0, s2 = 0;
    for (int i = 0; i < n; i++) { s += a[i]; s2 += a[i] * a[i]; }
    long long d = s - n * (n + 1) / 2;                       //> x − y
    long long d2 = s2 - n * (n + 1) * (2 * n + 1) / 6;       //> x² − y²
    long long sum = d2 / d;                                  //> x + y = (x² − y²) / (x − y)
    long long x = (d + sum) / 2, y = x - d;
    cout << "repeating " << x << ", missing " << y << endl;
    return 0;
}`,
    complexity: 'O(n) time, O(1) space.' });

  P({ id: 'ar-inversions', group: 'arr:C', title: 'Count inversions (merge sort)', level: 'hard', input: '5 5 3 2 4 1', tests: ['4 1 2 3 4'], gfg: 'https://www.geeksforgeeks.org/problems/inversion-of-array-1587115620/1', range: ['i', 'j'],
    prompt: '<p>Count pairs (i, j) with i &lt; j and a[i] &gt; a[j].</p>',
    idea: '<p>Piggy-back on <b>merge sort</b>. While merging two sorted halves, if <code>a[i] &gt; a[j]</code> (i in the left half, j in the right), then <b>every</b> element from i to the end of the left half is also bigger than a[j]. That is <code>mid − i + 1</code> inversions found at once. Each call returns its count up the recursion.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

long long mergeCount(vector<int>& a, int lo, int mid, int hi) {
    vector<int> tmp;
    int i = lo, j = mid + 1;
    long long cnt = 0;
    while (i <= mid && j <= hi) {
        if (a[i] <= a[j]) tmp.push_back(a[i++]);
        else {
            tmp.push_back(a[j++]);
            cnt += mid - i + 1;              //> a[i..mid] are all > the element just taken from the right.
        }
    }
    while (i <= mid) tmp.push_back(a[i++]);
    while (j <= hi) tmp.push_back(a[j++]);
    for (int k = lo; k <= hi; k++) a[k] = tmp[k - lo]; //> Copy the merged run back.
    return cnt;
}

long long sortCount(vector<int>& a, int lo, int hi) {
    if (lo >= hi) return 0;                   //> One element: no inversions.
    int mid = (lo + hi) / 2;
    long long c = sortCount(a, lo, mid);      //> Inversions inside the left half …
    c += sortCount(a, mid + 1, hi);           //> … inside the right half …
    c += mergeCount(a, lo, mid, hi);          //> … and between the halves.
    return c;
}

int main() {
    int n;
    cin >> n;
    vector<int> a(n);
    for (int i = 0; i < n; i++) cin >> a[i];
    cout << sortCount(a, 0, n - 1) << endl;
    return 0;
}`,
    complexity: 'O(n log n) instead of O(n²) for checking every pair.' });

  P({ id: 'ar-max-product', group: 'arr:C', title: 'Maximum product subarray', level: 'medium', input: '5 2 3 -2 4 -1', tests: ['3 -2 0 -1', '4 -2 3 -4 0'], lc: { n: 152, slug: 'maximum-product-subarray' },
    prompt: '<p>Find the contiguous subarray with the largest product.</p>',
    idea: '<p>Striver’s observation: the best product is always a <b>prefix product or a suffix product</b> of some zero-free stretch. With an even number of negatives, take everything. With an odd number, drop everything up to the first negative, or everything from the last one. Track the prefix product (left to right) and the suffix product (right to left) together, resetting to 1 after a zero.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int maxProduct(vector<int>& nums) {
    int n = nums.size();
    long long pre = 1, suf = 1, best = LLONG_MIN;
    for (int i = 0; i < n; i++) {
        if (pre == 0) pre = 1;                //> A zero splits the array: start over.
        if (suf == 0) suf = 1;
        pre *= nums[i];                       //> Product from the left …
        suf *= nums[n - 1 - i];               //> … and from the right, at the same time.
        best = max(best, max(pre, suf));
    }
    return best;
}

int main() {
    int n;
    cin >> n;
    vector<int> nums(n);
    for (int i = 0; i < n; i++) cin >> nums[i];
    cout << maxProduct(nums) << endl;
    return 0;
}` });
})();
