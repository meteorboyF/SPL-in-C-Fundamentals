#include <stdio.h>

int main()
{
    int n;
    printf("Enter the number of rows for the half-butterfly: ");
    scanf("%d", &n);

    // Initial space calculation from your code
    int space = (2 * n) - 2;

    // Loop through all 2n-1 rows of the pattern
    for (int row = 1; row <= ((2 * n) - 1); row++)
    {
        // Calculate the number of stars for the current row
        int stars = row;
        if (row > n)
            stars = 2 * n - row;

        // --- Left Wing (Modified to be hollow) ---
        for (int col = 1; col <= stars; col++)
        {
            // Print a star only on the borders (first or last star)
            if (col == 1 || col == stars) {
                printf("*");
            } else {
                printf(" ");
            }
        }

        // --- Middle Space (No change to this logic) ---
        for (int col = 1; col <= space; col++)
        {
            printf(" ");
        }

        // --- Right Wing (Modified to be hollow) ---
        for (int col = 1; col <= stars; col++)
        {
            if (col == 1 || col == stars) {
                printf("*");
            } else {
                printf(" ");
            }
        }

        // Update the space variable for the next row (No change)
        if (row < n)
            space -= 2;
        else
            space += 2;

        printf("\n");
    }
    return 0;
}