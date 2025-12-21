#include <stdio.h>

int main() {
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);

    // Outer loop for each row
    for (int row = 0; row < n; row++) {
        
        // --- Part 1: Print leading spaces ---
        // For row 0, we need n-1 spaces. For row 1, n-2 spaces, and so on.
        for (int col = 0; col < n - 1 - row; col++) {
            printf(" ");
        }

        // --- Part 2: Print stars ---
        // For row 0, we need 1 star. For row 1, 2 stars, and so on.
        for (int col = 0; col <= row; col++) {
            printf("*");
        }

        // Move to the next line after the row is complete
        printf("\n");
    }

    return 0;
}