// Arrays — 2D matrices (D) and 3D / K arrays (E).
(function () {
  const P = CN.add, R = String.raw;

  // ------------------------------------------------------------ D. 2D matrices
  P({ id: 'ar-set-zeroes', group: 'arr:D', title: 'Set matrix zeroes', level: 'medium', input: '3 4 0 1 2 0 3 4 5 2 1 3 1 5', tests: ['3 3 1 1 1 1 0 1 1 1 1'], lc: { n: 73, slug: 'set-matrix-zeroes' },
    prompt: '<p>If an element is 0, set its whole row and column to 0, in place.</p>',
    idea: '<p>Zeroing straight away would create new zeros that wipe out more rows. Use <b>two passes</b>: first <b>mark</b> which rows and columns contain a zero (in two marker vectors), then zero every cell whose row or column is marked. (The O(1)-space version stores the markers in the first row and column of the matrix itself.)</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

void setZeroes(vector<vector<int>>& mat) {
    int m = mat.size(), n = mat[0].size();
    vector<int> row(m, 0), col(n, 0);          //> Markers: row[i] = 1 means row i must become zeros.
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (mat[i][j] == 0) { row[i] = 1; col[j] = 1; }   //> Pass 1: only mark, don’t change the matrix yet.
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (row[i] || col[j]) mat[i][j] = 0;              //> Pass 2: zero the marked rows and columns.
}

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> mat(m, vector<int>(n));
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) cin >> mat[i][j];
    setZeroes(mat);
    for (int i = 0; i < m; i++) { for (int j = 0; j < n; j++) cout << mat[i][j] << " "; cout << endl; }
    return 0;
}`,
    complexity: 'O(m·n) time, O(m + n) space.' });

  P({ id: 'ar-rotate', group: 'arr:D', title: 'Rotate image by 90° (in place)', level: 'medium', input: '3 1 2 3 4 5 6 7 8 9', tests: ['4 5 1 9 11 2 4 8 10 13 3 6 7 15 14 12 16'], lc: { n: 48, slug: 'rotate-image' },
    prompt: '<p>Rotate an n × n matrix 90° clockwise without a second matrix.</p>',
    idea: '<p>Clockwise rotation = <b>transpose</b> (swap <code>a[i][j]</code> with <code>a[j][i]</code>, which mirrors the matrix across the main diagonal) followed by <b>reversing every row</b>. Only swap above the diagonal (<code>j &gt; i</code>), otherwise each pair is swapped twice and nothing changes.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

void rotate(vector<vector<int>>& a) {
    int n = a.size();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)            //> j > i: only the upper triangle.
            swap(a[i][j], a[j][i]);                //> Transpose: mirror across the main diagonal.
    for (int i = 0; i < n; i++)
        reverse(a[i].begin(), a[i].end());         //> Reverse each row → a clockwise turn.
}

int main() {
    int n;
    cin >> n;
    vector<vector<int>> a(n, vector<int>(n));
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) cin >> a[i][j];
    rotate(a);
    for (int i = 0; i < n; i++) { for (int j = 0; j < n; j++) cout << a[i][j] << " "; cout << endl; }
    return 0;
}`,
    complexity: 'O(n²) time, O(1) space.',
    tryit: ['Anticlockwise: transpose, then reverse each <b>column</b> (or reverse the rows first, then transpose).'] });

  P({ id: 'ar-spiral', group: 'arr:D', title: 'Spiral matrix traversal', level: 'medium', input: '3 4 1 2 3 4 5 6 7 8 9 10 11 12', tests: ['3 3 1 2 3 4 5 6 7 8 9', '1 3 1 2 3'], lc: { n: 54, slug: 'spiral-matrix' },
    prompt: '<p>Return all elements in spiral order.</p>',
    idea: '<p>Four walls: <code>top, bottom, left, right</code>. Go along the top row and move top down. Go down the right column and move right in. Go along the bottom row backwards and move bottom up. Go up the left column and move left in. The two <code>if</code> checks stop a single leftover row or column from being visited twice.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

vector<int> spiralOrder(vector<vector<int>>& mat) {
    vector<int> ans;
    int top = 0, bottom = mat.size() - 1, left = 0, right = mat[0].size() - 1;
    while (top <= bottom && left <= right) {
        for (int j = left; j <= right; j++) ans.push_back(mat[top][j]);      //> → along the top row
        top++;
        for (int i = top; i <= bottom; i++) ans.push_back(mat[i][right]);    //> ↓ down the right column
        right--;
        if (top <= bottom) {
            for (int j = right; j >= left; j--) ans.push_back(mat[bottom][j]); //> ← along the bottom row
            bottom--;
        }
        if (left <= right) {
            for (int i = bottom; i >= top; i--) ans.push_back(mat[i][left]);  //> ↑ up the left column
            left++;
        }
    }
    return ans;
}

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> mat(m, vector<int>(n));
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) cin >> mat[i][j];
    vector<int> ans = spiralOrder(mat);
    for (int x : ans) cout << x << " ";
    cout << endl;
    return 0;
}`,
    complexity: 'Each cell is visited once → O(m·n).' });

  P({ id: 'ar-transpose', group: 'arr:D', title: 'Transpose a matrix (any shape)', level: 'easy', input: '2 3 1 2 3 4 5 6', lc: { n: 867, slug: 'transpose-matrix' },
    prompt: '<p>Return the transpose: rows become columns.</p>',
    idea: '<p>An m × n matrix becomes n × m: <code>t[j][i] = a[i][j]</code>. When it isn’t square you need a <b>new</b> matrix with the dimensions swapped.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> a(m, vector<int>(n));
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) cin >> a[i][j];
    vector<vector<int>> t(n, vector<int>(m));     //> n rows, m columns: the shape is flipped.
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            t[j][i] = a[i][j];                    //> Row i of a becomes column i of t.
    for (int i = 0; i < n; i++) { for (int j = 0; j < m; j++) cout << t[i][j] << " "; cout << endl; }
    return 0;
}` });

  P({ id: 'ar-diag', group: 'arr:D', title: 'Matrix diagonal sum', level: 'easy', input: '3 1 2 3 4 5 6 7 8 9', tests: ['4 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1'], lc: { n: 1572, slug: 'matrix-diagonal-sum' },
    prompt: '<p>Sum the primary and secondary diagonals (count the centre once).</p>',
    idea: '<p>The primary diagonal is <code>a[i][i]</code> and the secondary is <code>a[i][n-1-i]</code>. One loop over i adds both. When n is odd they share the centre cell, so subtract it once.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<vector<int>> a(n, vector<int>(n));
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) cin >> a[i][j];
    int sum = 0;
    for (int i = 0; i < n; i++) {
        sum += a[i][i];                     //> Primary diagonal: row index = column index.
        sum += a[i][n - 1 - i];             //> Secondary diagonal: row + column = n − 1.
    }
    if (n % 2 == 1) sum -= a[n / 2][n / 2]; //> The centre was counted twice.
    cout << sum << endl;
    return 0;
}`,
    complexity: 'O(n), not O(n²): only the diagonals are touched.' });

  P({ id: 'ar-wealth', group: 'arr:D', title: 'Richest customer wealth (row sums)', level: 'easy', input: '3 3 1 2 3 3 2 1 4 4 0', lc: { n: 1672, slug: 'richest-customer-wealth' },
    prompt: '<p>accounts[i][j] is what customer i holds in bank j. Return the largest total.</p>',
    idea: '<p>Row sums: reset the sum for each row, add across the columns, and keep the maximum.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> acc(m, vector<int>(n));
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) cin >> acc[i][j];
    int best = 0;
    for (int i = 0; i < m; i++) {
        int sum = 0;                         //> A fresh total for each customer.
        for (int j = 0; j < n; j++) sum += acc[i][j];
        best = max(best, sum);
    }
    cout << best << endl;
    return 0;
}` });

  P({ id: 'ar-matmul', group: 'arr:D', title: 'Matrix multiplication', level: 'medium',
    prompt: '<p>Multiply a 2 × 3 matrix A by a 3 × 2 matrix B.</p>',
    idea: '<p><code>C[i][j]</code> is <b>row i of A</b> “dotted” with <b>column j of B</b>: <code>Σ A[i][k] × B[k][j]</code>. Three nested loops: i picks the row, j the column, and k walks along both. The inner sizes must match (3 = 3), and the result is 2 × 2. Watch <code>k</code> move across A’s row and down B’s column at the same time.</p>',
    code: R`
#include <stdio.h>

int main() {
    int A[2][3] = {{1, 2, 3}, {4, 5, 6}};
    int B[3][2] = {{7, 8}, {9, 10}, {11, 12}};
    int C[2][2] = {0};                          //> Start every cell of the result at 0.
    for (int i = 0; i < 2; i++)                 //> Row of A (and of C).
        for (int j = 0; j < 2; j++)             //> Column of B (and of C).
            for (int k = 0; k < 3; k++)         //> Walk along A’s row and B’s column together.
                C[i][j] += A[i][k] * B[k][j];
    for (int i = 0; i < 2; i++) printf("%d %d\n", C[i][0], C[i][1]);
    return 0;
}`,
    complexity: 'O(n·m·p) for an n×m times m×p product (O(n³) for square matrices).' });

  P({ id: 'ar-search2d', group: 'arr:D', title: 'Search a 2D matrix (as one sorted array)', level: 'medium', input: '3 4 1 3 5 7 10 11 16 20 23 30 34 60 16', tests: ['3 4 1 3 5 7 10 11 16 20 23 30 34 60 13'], lc: { n: 74, slug: 'search-a-2d-matrix' },
    prompt: '<p>Each row is sorted and each row starts after the previous one ends. Is target in the matrix?</p>',
    idea: '<p>Read row by row, the matrix is <b>one sorted array of m·n elements</b>. Binary search over the virtual index 0 … m·n−1 and convert each index to a cell: <code>row = mid / n</code>, <code>col = mid % n</code>. This is the same row-major mapping as the memory layout view.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

bool searchMatrix(vector<vector<int>>& a, int target) {
    int m = a.size(), n = a[0].size();
    int low = 0, high = m * n - 1;              //> Treat it as one array of m × n elements.
    while (low <= high) {
        int mid = (low + high) / 2;
        int r = mid / n, c = mid % n;           //> 1D index → (row, column).
        if (a[r][c] == target) return true;
        if (a[r][c] < target) low = mid + 1;    //> The target is to the right.
        else high = mid - 1;                    //> The target is to the left.
    }
    return false;
}

int main() {
    int m, n, t;
    cin >> m >> n;
    vector<vector<int>> a(m, vector<int>(n));
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) cin >> a[i][j];
    cin >> t;
    cout << (searchMatrix(a, t) ? "true" : "false") << endl;
    return 0;
}`,
    complexity: 'O(log(m·n)).' });

  P({ id: 'ar-toeplitz', group: 'arr:D', title: 'Toeplitz matrix', level: 'easy', input: '3 4 1 2 3 4 5 1 2 3 9 5 1 2', tests: ['2 2 1 2 2 2'], lc: { n: 766, slug: 'toeplitz-matrix' },
    prompt: '<p>Is every top-left to bottom-right diagonal constant?</p>',
    idea: '<p>Every cell (except those in the first row or column) must equal its <b>upper-left neighbour</b> <code>a[i-1][j-1]</code>.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> a(m, vector<int>(n));
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) cin >> a[i][j];
    bool ok = true;
    for (int i = 1; i < m; i++)
        for (int j = 1; j < n; j++)
            if (a[i][j] != a[i - 1][j - 1]) ok = false;   //> Different from the cell diagonally above-left.
    cout << (ok ? "true" : "false") << endl;
    return 0;
}` });

  P({ id: 'ar-flip', group: 'arr:D', title: 'Flipping an image', level: 'easy', input: '3 1 1 0 1 0 1 0 0 0', lc: { n: 832, slug: 'flipping-an-image' },
    prompt: '<p>Flip each row horizontally, then invert it (0 ↔ 1).</p>',
    idea: '<p>Two-pointer reverse on each row, combined with <code>1 − x</code> to invert. The middle cell of an odd row is only inverted.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<vector<int>> a(n, vector<int>(n));
    for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) cin >> a[i][j];
    for (int i = 0; i < n; i++) {
        int l = 0, r = n - 1;
        while (l < r) {
            int t = a[i][l];
            a[i][l] = 1 - a[i][r];          //> Swap and invert at the same time.
            a[i][r] = 1 - t;
            l++;
            r--;
        }
        if (l == r) a[i][l] = 1 - a[i][l];  //> The middle of an odd-length row.
    }
    for (int i = 0; i < n; i++) { for (int j = 0; j < n; j++) cout << a[i][j] << " "; cout << endl; }
    return 0;
}` });

  P({ id: 'ar-lucky', group: 'arr:D', title: 'Lucky numbers in a matrix', level: 'easy', input: '3 3 3 7 8 9 11 13 15 16 17', tests: ['2 2 7 8 1 2'], lc: { n: 1380, slug: 'lucky-numbers-in-a-matrix' },
    prompt: '<p>A lucky number is the minimum of its row and the maximum of its column.</p>',
    idea: '<p>Precompute every <b>row minimum</b> and every <b>column maximum</b> in one pass, then a cell is lucky exactly when its value equals both. That is O(m·n) instead of rescanning a row and a column for every cell.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int m, n;
    cin >> m >> n;
    vector<vector<int>> a(m, vector<int>(n));
    for (int i = 0; i < m; i++) for (int j = 0; j < n; j++) cin >> a[i][j];
    vector<int> rowMin(m, INT_MAX), colMax(n, INT_MIN);
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++) {
            rowMin[i] = min(rowMin[i], a[i][j]);
            colMax[j] = max(colMax[j], a[i][j]);
        }
    for (int i = 0; i < m; i++)
        for (int j = 0; j < n; j++)
            if (a[i][j] == rowMin[i] && a[i][j] == colMax[j]) cout << a[i][j] << " "; //> Smallest in its row and largest in its column.
    cout << endl;
    return 0;
}` });

  // ------------------------------------------------------------ E. 3D & K arrays
  P({ id: 'ar-3d-warehouse', group: 'arr:E', title: '3D array: totals per layer and the largest cell', level: 'easy', input: '4 9 2 7 5 1 3 8 6 2 10 4',
    prompt: '<p>Two warehouses (layers), each a 2 × 3 grid of shelves: <code>stock[w][r][c]</code>. Read the 12 values, print each warehouse’s total and the position of the fullest shelf.</p>',
    idea: '<p>Three nested loops: one per dimension. The outer index picks the <b>layer</b>, and a total that is reset per layer gives per-layer sums. Remember all three coordinates of the best cell. The Arrays tab shows one slice per warehouse.</p>',
    code: R`
#include <stdio.h>

int main() {
    int stock[2][2][3];                       //> 2 layers × 2 rows × 3 columns.
    for (int w = 0; w < 2; w++)
        for (int r = 0; r < 2; r++)
            for (int c = 0; c < 3; c++)
                scanf("%d", &stock[w][r][c]);
    int bw = 0, br = 0, bc = 0;               //> Coordinates of the best cell so far.
    for (int w = 0; w < 2; w++) {
        int total = 0;                        //> Reset for every layer.
        for (int r = 0; r < 2; r++)
            for (int c = 0; c < 3; c++) {
                total += stock[w][r][c];
                if (stock[w][r][c] > stock[bw][br][bc]) { bw = w; br = r; bc = c; }
            }
        printf("warehouse %d total = %d\n", w, total);
    }
    printf("fullest shelf: [%d][%d][%d] = %d\n", bw, br, bc, stock[bw][br][bc]);
    return 0;
}` });

  P({ id: 'ar-k-matrices', group: 'arr:E', title: 'Add K matrices (stored as one 3D vector)', level: 'medium', input: '3 2 2 1 2 3 4 5 6 7 8 9 10 11 12',
    prompt: '<p>Read K matrices of size R × C and print their element-wise sum.</p>',
    idea: '<p>K matrices form one <b>3D</b> container <code>m[k][r][c]</code>. The sum is a 2D matrix where <code>sum[r][c]</code> collects the same cell from every layer. Note the declaration: a vector of K vectors of R vectors of C ints.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int K, Rw, C;
    cin >> K >> Rw >> C;
    vector<vector<vector<int>>> m(K, vector<vector<int>>(Rw, vector<int>(C))); //> K × Rw × C, all zeros.
    for (int k = 0; k < K; k++)
        for (int r = 0; r < Rw; r++)
            for (int c = 0; c < C; c++) cin >> m[k][r][c];
    vector<vector<int>> sum(Rw, vector<int>(C, 0));
    for (int k = 0; k < K; k++)                   //> For every layer …
        for (int r = 0; r < Rw; r++)
            for (int c = 0; c < C; c++)
                sum[r][c] += m[k][r][c];          //> … add its cell (r, c) into the same cell of the sum.
    for (int r = 0; r < Rw; r++) { for (int c = 0; c < C; c++) cout << sum[r][c] << " "; cout << endl; }
    return 0;
}`,
    complexity: 'O(K·R·C).' });

  P({ id: 'ar-merge-k', group: 'arr:E', title: 'Merge K sorted arrays', level: 'hard', input: '3 3 1 4 7 2 2 5 4 0 3 6 9', gfg: 'https://www.geeksforgeeks.org/problems/merge-k-sorted-arrays/1',
    prompt: '<p>Read K sorted arrays (each as its length then its values) and merge them into one sorted array.</p>',
    idea: '<p>The two-array merge, generalised. Keep <b>one pointer per array</b> in <code>pos[k]</code>. Each round, look at the K front elements, take the smallest, and move that array’s pointer forward. (With a min-heap, picking the smallest is O(log K) instead of O(K), which is covered in the Heaps chapter.)</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int K;
    cin >> K;
    vector<vector<int>> arr(K);
    int total = 0;
    for (int k = 0; k < K; k++) {
        int len;
        cin >> len;
        arr[k].resize(len);                     //> Each array can have its own length.
        for (int i = 0; i < len; i++) cin >> arr[k][i];
        total += len;
    }
    vector<int> pos(K, 0), out;                 //> pos[k] = next unused index in array k.
    while (out.size() < total) {
        int best = -1;
        for (int k = 0; k < K; k++) {
            if (pos[k] < arr[k].size() && (best == -1 || arr[k][pos[k]] < arr[best][pos[best]])) best = k; //> The smallest front element among the arrays that still have elements.
        }
        out.push_back(arr[best][pos[best]]);
        pos[best]++;                            //> That array’s front moves forward.
    }
    for (int x : out) cout << x << " ";
    cout << endl;
    return 0;
}`,
    complexity: 'O(N·K) for N elements in total (O(N log K) with a heap).' });

  P({ id: 'ar-intersect-k', group: 'arr:E', title: 'Intersection of K arrays', level: 'easy', input: '3 5 3 1 2 4 5 4 1 2 3 4 4 3 4 5 6', lc: { n: 2248, slug: 'intersection-of-multiple-arrays' },
    prompt: '<p>Each of the K arrays has distinct values. Return the values present in <b>all</b> K arrays, sorted.</p>',
    idea: '<p>Count how many arrays each value appears in. A value is in the intersection exactly when its count is K. An ordered <code>map</code> gives the answer already sorted.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int K;
    cin >> K;
    map<int, int> cnt;                       //> value → number of arrays containing it.
    for (int k = 0; k < K; k++) {
        int len;
        cin >> len;
        for (int i = 0; i < len; i++) {
            int x;
            cin >> x;
            cnt[x]++;
        }
    }
    for (auto p : cnt) {
        if (p.second == K) cout << p.first << " ";   //> Present in every array.
    }
    cout << endl;
    return 0;
}` });

  P({ id: 'ar-kd-index', group: 'arr:E', title: 'K-dimensional index ↔ flat index', level: 'medium', input: '3 2 3 4 1 2 3', tests: ['2 3 4 2 1', '4 2 2 2 2 1 0 1 1'],
    prompt: '<p>An array has K dimensions with sizes d1 … dK. Given an index tuple, compute its position in memory (row-major), then convert the position back into the tuple.</p>',
    idea: '<p>The <b>stride</b> of a dimension is the product of all the sizes after it (the last dimension has stride 1). The flat index is <code>Σ index[d] × stride[d]</code>. To go back, divide by each stride from the left and keep the remainder. This is what the compiler does for <code>a[i][j][k]</code>.</p>',
    code: R`
#include <bits/stdc++.h>
using namespace std;

int main() {
    int K;
    cin >> K;
    vector<int> dim(K), idx(K), stride(K);
    for (int d = 0; d < K; d++) cin >> dim[d];
    for (int d = 0; d < K; d++) cin >> idx[d];
    stride[K - 1] = 1;                          //> Moving the last index by 1 moves 1 element.
    for (int d = K - 2; d >= 0; d--) stride[d] = stride[d + 1] * dim[d + 1]; //> One step here skips a whole block of the dimensions after it.
    int flat = 0;
    for (int d = 0; d < K; d++) flat += idx[d] * stride[d];
    cout << "flat index = " << flat << endl;
    vector<int> back(K);
    int rest = flat;
    for (int d = 0; d < K; d++) {
        back[d] = rest / stride[d];             //> How many whole blocks of this dimension fit …
        rest = rest % stride[d];                //> … and what is left for the later dimensions.
    }
    cout << "back to tuple:";
    for (int d = 0; d < K; d++) cout << " " << back[d];
    cout << endl;
    return 0;
}`,
    tryit: ['Check it against the memory layout view of the 3D example (dims 2 3 4): [1][2][3] is element 23.'] });
})();
