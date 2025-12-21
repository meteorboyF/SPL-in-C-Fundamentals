#include<stdio.h>


int main(){
int n;
printf("Enter the number of rows: ");
scanf("%d",&n);
int count=1;
for(int row=0;row<n;row++){
    for(int col=0;col<row;col++){
        printf("%d ",count);
        count++;
    }
    printf("\n");

}

    




}