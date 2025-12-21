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
            
            // --- The Core Logic for the 'Y' Shape ---
            // This is a two-part condition.

            if (// Condition for the top 'V' part of the 'Y'
                (row < (n / 2) && (row == col || row + col == n - 1)) ||
                
                // Condition for the bottom vertical stem of the 'Y'
                (row >= (n / 2) && col == (n / 2))) {
                
                printf("*");
            } else {
                printf(" ");
            }
        }
        // Move to the next line after the row is complete
        printf("\n");
    }

    return 0;
}