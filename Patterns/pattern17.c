#include <stdio.h>

int main()
{
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);
    int space = 0;
    for (int row = 0; row < n; row++)
    {
        // stars
        for (int col = 0; col < n - row; col++)
        {
            printf("*");
        }
        // space
        for (int col = 0; col < space; col++)
        {
            printf(" ");
        }

        // stars
        for (int col = 0; col < n - row; col++)
        {

            printf("*");
        }

        space += 2;

        printf("\n");
    }

    space = 2 * (n - 1);
    for (int row = 0; row < n; row++)
    {
        // stars
        for (int col = 0; col <= row; col++)
        {
            printf("*");
        }
        // space
        for (int col = 0; col < space; col++)
        {
            printf(" ");
        }

        // stars
        for (int col = 0; col <= row; col++)
        {

            printf("*");
        }

        space -= 2;

        printf("\n");
    }
}