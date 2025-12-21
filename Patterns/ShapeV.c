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
            
            // --- The Core Logic for the 'V' Shape ---
            // A star is printed if it's on a diagonal AND in the top half.

            if (// Part 1: Regional Constraint (Is it in the top half, including the middle row?)
                (row <= n / 2) && 
                
                // Part 2: Pattern Logic (Is it on one of the 'X' diagonals?)
                (row == col || row + col == n - 1)) {
                
                printf("*");
            } else {
                printf(" "); // If not part of the shape, print a space
            }
        }
        // Move to the next line after the row is complete
        printf("\n");
    }

    return 0;
}