#include <stdio.h>

int main() {
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);

    // Outer loop for each row
    for (int row = 0; row < n; row++) {
        // Inner loop defines the shape's boundary for the current row
        for (int col = 0; col < n - row; col++) {
            // A star is printed only if it's a border element
            if (col == 0 ||         // First column (left vertical border)
                row == 0 ||         // First row (top horizontal border)
                col == n - row - 1) { // Diagonal edge
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}