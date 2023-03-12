//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.17;

import "./InsuranceV2.sol";
import "./SplitRiskV2Assist.sol";
import "./InsureAssist.sol";
import "hardhat/console.sol";

contract RiskSpectrumFactory {
    //mapping(address => address) public riskSpectrumContracts;
    //need to index firstly using c, then cx and cy together as a pair 
    mapping(address => address[]) riskSpectrums;

    //to access it using dynamic routing do i have to generate a hash, unique value that can address the different contracts 

    function deployRiskSpectrum (address Implementation) public {
        console.log(Implementation);
        SplitInsuranceV2 newRiskSpectrum = SplitInsuranceV2(Implementation);
        console.log("got spectrum")
        // bytes memory constructData = abi.encodeWithSignature("function initialize (address _Assist)");//is this valid?
        // Proxy proxy = new Proxy(constructData, address(newRiskSpectrum));
        // console.log("proxy address: ", address(proxy));
        //riskSpe
    }
}