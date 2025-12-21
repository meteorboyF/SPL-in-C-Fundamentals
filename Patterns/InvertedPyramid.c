#include<stdio.h>


int main(){
int n;
printf("Enter the number of rows: ");
scanf("%d",&n);

for(int row=0;row<n;row++){
    for(int col=0;col<row;col++){
        printf(" ");
    }
    for(int col=0;col<(2*n-(2*row+1));col++){
        printf("*");
    }
    for(int col=0;col<row;col++){
        printf(" ");
    }
    printf("\n");

}

}