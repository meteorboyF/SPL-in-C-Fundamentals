#include <stdio.h>

int main() {
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);

    // Outer loop for each row
    for (int row = 0; row < n; row++) {
        // Print leading spaces (same as the solid version)
        for (int col = 0; col < row; col++) {
            printf(" ");
        }

        // Loop that defines the region of the triangle
        for (int col = 0; col < n - row; col++) {
            // Print a star only if it's a border element
            if (col == 0 ||             // First star of the sequence (left slanted border)
                row == 0 ||             // Top row (top horizontal border)
                col == n - row - 1) {   // Last star of the sequence (right vertical border)
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    return 0;
}