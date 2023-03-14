//SPDX-License-Identifier: MIT

import "hardhat/console.sol";

pragma solidity ^0.8.1;


contract Proxy {
    address public implementation;
    // Code position in storage is keccak256("PROXIABLE") = "0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7"
    constructor(bytes memory constructData, address contractLogic) {

        implementation = contractLogic;
        console.log("implementation dfsdf is", implementation);
        assembly { // solium-disable-line
            sstore(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7, contractLogic)
        }
        console.log("this imp addr rgt after sstore", implementation);//matches the actual intended value

        (bool success, bytes memory result ) = contractLogic.delegatecall(constructData); // solium-disable-line
        implementation = contractLogic;
        console.log("this imp addr later after sstore", contractLogic);
        require(success, "Construction failed");
        console.log("this imp addr", implementation);
    }

    // function getContractLogic () public returns (address){
        // assembly { // solium-disable-line
            // _implementation := sload(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7)
        // }
    // }
    //check the above thing lataer

    fallback() external payable {
        assembly { // solium-disable-line
            let contractLogic := sload(0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7)
            calldatacopy(0x0, 0x0, calldatasize())
            let success := delegatecall(sub(gas(), 10000), contractLogic, 0x0, calldatasize(), 0, 0)
            let retSz := returndatasize()
            returndatacopy(0, 0, retSz)
            switch success
            case 0 {
                revert(0, retSz)
            }
            default {
                return(0, retSz)
            }
        }
    }
    receive() external payable {}

}
// keep separate owners for implementation and proxy, TransparentUpgradeableProxy

//check docs for transparentupgradeableproxy