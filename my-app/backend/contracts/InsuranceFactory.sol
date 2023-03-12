//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.17;

import "./InsuranceV2.sol";
import "./SplitRiskV2Assist.sol";
import "./InsureAssist.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RiskSpectrumFactory {
    //mapping(address => address) public riskSpectrumContracts;
    //need to index firstly using c, then cx and cy together as a pair 
    mapping(address => address[]) public riskSpectrums;
    //readability is important, so i will use the following naming convention, "c, 2 protocols"

    //to access it using dynamic routing do i have to generate a hash, unique value that can address the different contracts 

    function deployRiskSpectrum (address Implementation, address Assist) public{
        console.log(Implementation);
        SplitInsuranceV2 newRiskSpectrum = SplitInsuranceV2(Implementation);
        console.log("got spectrum");
        bytes memory constructData = abi.encodeWithSignature("initialize(address)", Assist);//is this valid?
        Proxy proxy = new Proxy(constructData, address(newRiskSpectrum));
        address investingToken = newRiskSpectrum.c();
        riskSpectrums[investingToken].push(address(proxy));
        //use address of investing token
    }

    function returnData (address _proxy) public view returns(string memory){
        Proxy proxy = Proxy(_proxy);
        string returnData = "";
        IERC20 c = IERC20(proxy.c());
        IERC20 cx = IERC20(proxy.cx());
        IERC20 cy = IERC20(proxy.cy());
        returnData += c.name();
        returnData += cx.name();
        returnData += cy.name();
        return returnData;
    }
}