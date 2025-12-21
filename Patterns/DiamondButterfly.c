#include <stdio.h>

int main()
{
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);
    int space = (2 * n) - 2;
    for (int row = 1; row <=((2 * n) - 1); row++)
    {
        // star
        int star = row;
        if (row > n)
            star = 2 * n - row;
        for (int col = 0; col < star; col++)
        {
            printf("*");
        }
        // space
        for (int col = 0; col < space; col++)
        {
            printf(" ");
        }
        // star
        for (int col = 0; col < star; col++)
        {
            printf("*");
        }

        if (row < n)
            space -= 2;
        else
            space += 2;

        printf("\n");
    }
}