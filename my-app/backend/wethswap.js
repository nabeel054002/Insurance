const {swapWETHForDAI} =require("./WethForDai")

swapWETHForDAI().then(() => console.log('Done!'))
.catch((e) => console.log('Error is: ', e))
