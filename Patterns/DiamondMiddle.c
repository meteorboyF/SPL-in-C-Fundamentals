#include<stdio.h>

int main() {
    int n;
    printf("Enter the number of rows for the half-diamond: ");
    scanf("%d", &n);

    // --- Top Half (prints the middle line) ---
    // This part of your code is perfect and needs no changes.
    for (int row = 0; row < n; row++) {
        for (int col = 0; col < n - row - 1; col++) {
            printf(" ");
        }
        for (int col = 0; col < 2 * row + 1; col++) {
            printf("*");
        }
        // Trailing spaces are optional
        // for(int col=0;col<n-row-1;col++){
        //     printf(" ");
        // }
        printf("\n");
    }

    // --- Bottom Half (starts AFTER the middle line) ---
    // THE ONLY CHANGE IS HERE: We start the loop from row = 1 instead of row = 0.
    for (int row = 1; row < n; row++) {
        for (int col = 0; col < row; col++) {
            printf(" ");
        }
        for (int col = 0; col < (2 * n - (2 * row + 1)); col++) {
            printf("*");
        }
        // for(int col=0;col<row;col++){
        //     printf(" ");
        // }
        printf("\n");
    }

    return 0; // It's good practice to add this
}