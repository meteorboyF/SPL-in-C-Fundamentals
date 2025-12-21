#include<stdio.h>


int main(){
int n;
printf("Enter the number of rows: ");
scanf("%d",&n);
int space=2*(n-1);
for(int row=1;row<=n;row++){
    //num
    for(int col=1;col<=row;col++){
        printf("%d",col);
    }
    //space
    for(int col=1;col<=space;col++){
        printf("_");
    }
    for(int col=row;col>=1;col--){
        printf("%d",col);
    }
    space-=2;

    printf("\n");

}



}