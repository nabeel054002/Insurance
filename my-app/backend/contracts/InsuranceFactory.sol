//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.17;

import "./InsuranceV2.sol";
import "./SplitRiskV2Assist.sol";
import "./InsureAssist.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract RiskSpectrumFactory {

    struct riskSpectrum {
        string c;
        string cx;
        string cy;
    }
    
    mapping(address => riskSpectrum) public detailsOfRiskSpectrums;
    mapping(address => address) public riskSpectrumContracts;
    address [] public riskSpectrumContractsArray;
    uint32 public riskSpectrumContractsArrayLength;
    //readability is important, so i will use the following naming convention, "c, 2 protocols"
    //to access it using dynamic routing do i have to generate a hash, unique value that can address the different contracts 

    function deployRiskSpectrum (address payable Implementation, address Assist) public{
        console.log("About to deploy");
        SplitInsuranceV2 newRiskSpectrum = SplitInsuranceV2(Implementation);
        console.log("newRiskSpectrum works");
        bytes memory constructData = abi.encodeWithSignature("initialize(address)", Assist);//is this valid?
        console.log("constructData works");
        Proxy proxy = new Proxy(constructData, Implementation);
        console.log("proxy deployed");
        riskSpectrumContracts[Implementation] = address(proxy);
        console.log("riskspectrumcontracts thing");
        riskSpectrum memory imp = returnData(payable(Implementation));
        console.log("imp works");
        detailsOfRiskSpectrums[address(proxy)] = imp;
        console.log("details of riskspectrumcontracts thing");
        riskSpectrumContractsArray.push(address(proxy));
        console.log("riskspectrumcontractsarray thing");
        riskSpectrumContractsArrayLength++;
    }

    function returnData (address payable _implementation) public returns(riskSpectrum memory){
        // returns(riskSpectrum memory)
        SplitInsuranceV2 proxy = SplitInsuranceV2(payable(riskSpectrumContracts[_implementation]));   
        //the issue with the previous thign was implementation contract was not initialized
        //how to read from a proxy contract
        console.log("implementation recieved", proxy.c());
        ERC20 c = ERC20(proxy.c());
        ERC20 cx = ERC20(proxy.cx());
        ERC20 cy = ERC20(proxy.cy());
        console.log("c, cx and cy");
        console.log("name of c token is", c.name());
        riskSpectrum memory returnsThis;
        returnsThis.c = c.name();
        console.log("c.name() works");
        returnsThis.cx = cx.name();
        console.log("cx.name() works");
        returnsThis.cy = cy.name();
        console.log("cy.name() works");
        return returnsThis;
    }
}