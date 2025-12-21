#include <stdio.h>
int main() {
int n;
printf("Enter the number of rows: ");
scanf("%d", &n);

// Outer loop for each row
for (int row = 0; row < n; row++) {
    // Part 1: Print leading spaces
    // For row 0, print 0 spaces. For row 1, print 1 space, etc.
    for (int col = 0; col < row; col++) {
        printf(" ");
    }

    // Part 2: Print stars
    // For row 0, print n stars. For row 1, print n-1 stars, etc.
    for (int col = 0; col < n - row; col++) {
        printf("*");
    }
    printf("\n");
}
return 0;
}