#include <stdio.h>

int main() {
    int n;

    // Prompt the user for the size of the square
    printf("Enter the size (an odd number >= 5 is recommended): ");
    scanf("%d", &n);

    // Bounding box: outer loop for rows
    for (int row = 0; row < n; row++) {
        // Inner loop for columns
        for (int col = 0; col < n; col++) {
            
            // --- The Core Logic for the 'W' Shape ---
            // A star is printed if it's on a vertical bar OR the bottom 'V'.

            if (// Condition 1: The two outer vertical bars
                col == 0 || col == n - 1 ||
                
                // Condition 2: The inner 'V' shape in the bottom half
                (row >= n / 2 && (row == col || row + col == n - 1))) {
                
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