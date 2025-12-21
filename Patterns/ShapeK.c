#include <stdio.h>

int main() {
    int n;

    // Prompt the user for the size of the square
    printf("Enter the size (an odd number >= 5 is recommended): ");
    scanf("%d", &n);

    // Calculate the middle row index. This is the meeting point for the diagonals.
    int mid = (n - 1) / 2;

    // Bounding box: outer loop for rows
    for (int row = 0; row < n; row++) {
        // Inner loop for columns
        for (int col = 0; col < n; col++) {
            
            // --- The Core Logic for the 'K' Shape ---
            // A star is printed if it's on the vertical bar, OR the upper diagonal, OR the lower diagonal.

            if (// Part 1: The left vertical bar
                col == 0 ||
                
                // Part 2: The upper diagonal (row + col == mid)
                (row + col == mid) ||
                
                // Part 3: The lower diagonal (row - col == mid)
                (row - col == mid)) {
                
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