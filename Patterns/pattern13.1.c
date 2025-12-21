#include<stdio.h>


int main(){
int n;
printf("Enter the number of rows: ");
scanf("%d",&n);

for(int row=0;row<n;row++){
    for(char col='A';col<='A'+(n-row-1);col++){
        printf("%c ",col);
        
    }
    printf("\n");

}

}