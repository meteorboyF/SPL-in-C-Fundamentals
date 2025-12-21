#include <stdio.h>

int main()
{
    int n;
    printf("Enter the number of rows for the half-hourglass: ");
    scanf("%d", &n);

    // The number of spaces starts at 0 and increases
    int space = 0;

    // Loop through all 2n-1 rows
    for (int row = 1; row <= ((2 * n) - 1); row++)
    {
        // Calculate the number of stars for this row
        int stars = n - space;

        // Print leading spaces
        for (int col = 1; col <= space; col++)
        {
            printf(" ");
        }

        // --- Print the hollow star part ---
        int total_chars = (2 * stars) - 1;
        for (int col = 1; col <= total_chars; col++)
        {
            // Print a star only on the borders (first, last, or the top row)
            // The row==1 check is to make the top line solid.
            if (row == 1 || col == 1 || col == total_chars || row==2*n-1) {
                printf("*");
            } else {
                printf(" ");
            }
        }

        // Update the space variable
        if (row < n)
            space++;
        else
            space--;

        printf("\n");
    }
    return 0;
}