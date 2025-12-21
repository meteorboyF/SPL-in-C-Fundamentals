#include <stdio.h>

int main() {
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);

    // Outer loop for each row (no change)
    for (int row = 0; row < n; row++) {
        
        // Loop for printing leading spaces (no change)
        for (int col = 0; col < n - 1 - row; col++) {
            printf(" ");
        }

        // Loop that defines the region where the triangle exists
        for (int col = 0; col <= row; col++) {
            
            // --- This is the new logic to make the triangle hollow ---
            // A star is printed only if it's on a border.

            if (col == 0 ||         // Is it the first star in the sequence? (Left slanted border)
                row == n - 1 ||     // Is it the last row? (Bottom horizontal border)
                col == row) {       // Is it the last star in the sequence? (Right vertical border)
                
                printf("*");
            } else {
                printf(" "); // For any interior position, print a space
            }
        }

        // Move to the next line
        printf("\n");
    }

    return 0;
}