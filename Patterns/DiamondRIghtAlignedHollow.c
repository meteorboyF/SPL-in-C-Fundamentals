#include<stdio.h>

int main() {
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);

    for (int row = 1; row < 2 * n; row++) {
        // Calculate the number of characters (same logic)
        int total_chars = row;
        if (row > n) {
            total_chars = 2 * n - row;
        }

        // Print the leading spaces (from the "opposite" pattern)
        for (int col = 0; col < n - total_chars; col++) {
            printf(" ");
        }

        // Print the hollow part (from the "hollow" pattern)
        for (int col = 0; col < total_chars; col++) {
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