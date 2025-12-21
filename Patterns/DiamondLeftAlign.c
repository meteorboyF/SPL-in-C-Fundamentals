#include<stdio.h>

int main(){

int n;
printf("Enter the number of rows: ");
scanf("%d",&n);

for(int row=0;row<2*n;row++){
    int stars=row;
    if(row>n)stars=2*n-row;
    for(int col=0;col<stars;col++){
        printf("*");
    }
    printf("\n");

}


}