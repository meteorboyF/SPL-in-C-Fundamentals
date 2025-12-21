#include<stdio.h>


int main(){
int n;
printf("Enter the number of rows: ");
scanf("%d",&n);

for(int row=0;row<n;row++){
    for(int col=0;col<n-row-1;col++){
        printf(" ");
    }
    char ch='A';
    int breaking=(row*2+1)/2;
    for(int col=0;col<2*row+1;col++){
        if(col<breaking){
        printf("%c",ch++);
        }
        else{
        printf("%c",ch--);    
        }
    }
    for(int col=0;col<n-row-1;col++){
        printf(" ");
    }
    printf("\n");

}

}