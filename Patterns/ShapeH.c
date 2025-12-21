#include <stdio.h>

int main() {
    int n;

    // Prompt the user for the size of the square
    printf("Enter the size (an odd number >= 5 is recommended): ");
    scanf("%d", &n);

    // Add a check for invalid input to ensure the pattern looks good
    if (n < 3) {
        printf("Error: Size must be at least 3.\n");
        return 1; // Exit with an error
    }

    // The "Bounding Box" - outer loop for rows
    for (int row = 0; row < n; row++) {
        // Inner loop for columns
        for (int col = 0; col < n; col++) {
            
            // --- The Core Logic for the 'H' Shape ---
            // A star is printed if the condition is true.
            // The condition checks for three possibilities:
            
            if (col == 0 ||             // Is it in the first column? (Left vertical bar)
                col == n - 1 ||         // Is it in the last column? (Right vertical bar)
                row == (n - 1) / 2) {   // Is it in the middle row? (Horizontal bar)
                
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