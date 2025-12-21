#include<stdio.h>

int main() {
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);

    // --- Top Half of the Hollow Diamond ---
    for (int row = 0; row < n; row++) {
        // Print leading spaces
        for (int col = 0; col < n - row - 1; col++) {
            printf(" ");
        }
        // Print the stars and inner spaces for the current row
        for (int col = 0; col < 2 * row + 1; col++) {
            if (col == 0 || col == 2 * row) {
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }
    // --- Bottom Half (Using YOUR inverted pyramid logic) ---
    // We start from row = 1 to avoid re-printing the middle line.
    for (int row = 1; row < n; row++) {
        // Print leading spaces (your original logic)
        for (int col = 0; col < row; col++) {
            printf(" ");
        }

        // --- THIS IS THE MODIFIED PART ---
        // Get the total width of the star part for this row
        int width = 2 * n - (2 * row + 1);

        // Print the stars and inner spaces
        for (int col = 0; col < width; col++) {
            // Check if it's the first star (col==0) or the last star (col==width-1)
            if (col == 0 || col == width - 1) {
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }

    return 0;
}