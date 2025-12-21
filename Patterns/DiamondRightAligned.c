#include<stdio.h>

int main() {
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);

    for (int row = 1; row < 2 * n; row++) {
        // Calculate the number of stars for this row (same logic as before)
        int stars = row;
        if (row > n) {
            stars = 2 * n - row;
        }

        // --- THIS IS THE NEW PART ---
        // Print the leading spaces to push the pattern to the right
        for (int col = 0; col < n - stars; col++) {
            printf(" ");
        }
        // --------------------------

        // This star-printing loop is unchanged
        for (int col = 0; col < stars; col++) {
            printf("*");
        }
        printf("\n");
    }

    return 0;
}