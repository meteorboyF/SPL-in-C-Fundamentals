#include <stdio.h>

int main() {
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);

    // Outer loop for each row (no change here)
    for (int row = 0; row < n; row++) {
        
        // Inner loop for each column (the condition is the same, but the inside is different)
        for (int col = 0; col <= row; col++) {
            
            // --- This is the new logic to make the triangle hollow ---
            // A star is printed only if it's a border element.
            
            if (col == 0 ||         // Is it the first column? (Left vertical border)
                row == n - 1 ||     // Is it the last row? (Bottom horizontal border)
                col == row) {       // Is it on the diagonal? (Right slanted border)
                
                printf("*");
            } else {
                printf(" "); // For any interior position, print a space
            }
        }
        
        printf("\n"); // Move to the next line (no change here)
    }
    
    return 0;
}