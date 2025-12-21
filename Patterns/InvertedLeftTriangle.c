#include <stdio.h>

int main() {
    int n;
    printf("Enter the number of rows: ");
    scanf("%d", &n);

    // Outer loop for each row
    for (int row = 0; row < n; row++) {
        // Inner loop prints n-row stars.
        // For row 0, it prints n stars. For row 1, n-1 stars, and so on.
        for (int col = 0; col < n - row; col++) {
            printf("*");
        }
        printf("\n");
    }
    return 0;
}