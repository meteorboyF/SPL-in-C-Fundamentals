#include<stdio.h>


int main(){
int n;
printf("Enter the number of rows: ");
scanf("%d",&n);

for(int row=0;row<n;row++){
    for(char col='A';col<='A'+row;col++){
        printf("%c ",col);
        
    }
    printf("\n");

}

}