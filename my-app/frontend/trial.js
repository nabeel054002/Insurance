import {utils} from "ethers";

let number = 0.418
const numberBN = utils.parseUnits(number.toString(), 18);
console.log(numberBN.toString());