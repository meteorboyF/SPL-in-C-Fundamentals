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
        // Calculate the number of stars for the current row
        // This is the inverse of the butterfly's star logic
        int stars = n - space;

        // --- Part 1: Print leading spaces ---
        for (int col = 1; col <= space; col++)
        {
            printf(" ");
        }

        // --- Part 2: Print the stars ---
        for (int col = 1; col <= (2 * stars) - 1; col++)
        {
            printf("*");
        }

        // Update the space variable for the next row
        if (row < n)
            space++;
        else
            space--;

        printf("\n");
    }
    return 0;
}