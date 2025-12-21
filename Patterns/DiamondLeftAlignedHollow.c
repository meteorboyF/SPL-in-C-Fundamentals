#include<stdio.h>

int main() {
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);

    // Loop from 1 to cover all 2n-1 rows of the pattern
    for (int row = 1; row < 2 * n; row++) {
        // Calculate the number of characters (stars/spaces) for this row
        int total_chars = row;
        if (row > n) {
            total_chars = 2 * n - row;
        }

        // The CHANGE is inside this loop
        for (int col = 0; col < total_chars; col++) {
            // Print a star only on the borders (first or last position)
            if (col == 0 || col == total_chars - 1) {
                printf("*");
            } else {
                printf(" ");
            }
        }
        printf("\n");
    }

    return 0;
}