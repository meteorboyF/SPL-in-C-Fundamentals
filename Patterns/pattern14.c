#include<stdio.h>


int main(){
int n;
printf("Enter the number of rows: ");
scanf("%d",&n);

for(int row=0;row<n;row++){
    char ch='A'+row;
    for(int col=0;col<=row;col++){
        printf("%c ",ch);   
    }
    printf("\n");

}

}