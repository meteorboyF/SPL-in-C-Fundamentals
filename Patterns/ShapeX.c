#include <stdio.h>

int main() {
    int n;

    // Prompt the user for the size of the square
    printf("Enter the size (an odd number is recommended): ");
    scanf("%d", &n);

    // Bounding box: outer loop for rows
    for (int row = 0; row < n; row++) {
        // Inner loop for columns
        for (int col = 0; col < n; col++) {
            
            // --- The Core Logic for the 'X' Shape ---
            // A star is printed if the cell is on one of the two main diagonals.

            if (row == col ||             // Is it on the major diagonal (top-left to bottom-right)?
                row + col == n - 1) {   // OR is it on the anti-diagonal (top-right to bottom-left)?
                
                printf("*");
            } else {
                printf(" "); // If not on a diagonal, print a space
            }
        }
        // Move to the next line after the row is complete
        printf("\n");
    }

    return 0;
}