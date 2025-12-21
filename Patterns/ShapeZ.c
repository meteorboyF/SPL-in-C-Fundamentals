#include <stdio.h>

int main() {
    int n;

    // Prompt the user for the size of the square
    printf("Enter the size (n >= 3 is recommended): ");
    scanf("%d", &n);

    // Bounding box: outer loop for rows
    for (int row = 0; row < n; row++) {
        // Inner loop for columns
        for (int col = 0; col < n; col++) {
            
            // --- The Core Logic for the 'Z' Shape ---
            // A star is printed if it's on the top row, bottom row, OR the anti-diagonal.

            if (row == 0 ||             // Is it on the first row? (Top bar)
                row == n - 1 ||         // Is it on the last row? (Bottom bar)
                row + col == n - 1) {   // Is it on the anti-diagonal? (Connecting bar)
                
                printf("*");
            } else {
                printf(" "); // If not on one of those lines, print a space
            }
        }
        // Move to the next line after the row is complete
        printf("\n");
    }

    return 0;
}