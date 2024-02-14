//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.17;

import "./InsuranceV2.sol";
import "./SplitRiskV2Assist.sol";
import "./InsureAssist.sol";
import "./trancheAMM.sol";
import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract RiskSpectrumFactory {

    using SafeMath for uint256;

    struct riskSpectrum {
        string c;
        string cx;
        string cy;
    }

    struct Liquidity {
        uint256 balanceA;
        uint256 balanceB;
    }

    mapping (address => Liquidity) public liquidity;
    mapping(address => address) public riskSpectrumContracts;
    mapping(address => address) public riskSpectrumExchangeContracts;
    address [] public riskSpectrumContractsArray;
    uint32 public riskSpectrumContractsArrayLength;
    //readability is important, so i will use the following naming convention, "c, 2 protocols"
    //to access it using dynamic routing do i have to generate a hash, unique value that can address the different contracts 


    event LiquidityAdded(address indexed liquidityProvider, uint256 amountA, uint256 amountB);
    event LiquidityRemoved(address indexed liquidityProvider, uint256 amountA, uint256 amountB);
    event SwapExecuted(address indexed user, uint256 amountAOut, uint256 amountBOut, uint256 amountAIn, uint256 amountBIn);

    function deployRiskSpectrum (address payable Implementation, address Assist) public{
        SplitInsuranceV2 newRiskSpectrum = SplitInsuranceV2(Implementation);
        bytes memory constructData = abi.encodeWithSignature("initialize(address)", Assist);
        Proxy proxy = new Proxy(constructData, Implementation);
        SplitInsuranceV2 proxyI = SplitInsuranceV2(payable(address(proxy)));
        Exchange exchange = new Exchange(proxyI.A(), proxyI.B());
        riskSpectrumExchangeContracts[Implementation] = address(exchange);
        console.log("riskSpectrumExchangeContracts[Implementation]", riskSpectrumExchangeContracts[Implementation]);
        riskSpectrumContracts[Implementation] = address(proxy);
        riskSpectrumContractsArray.push(address(proxy));
        riskSpectrumContractsArrayLength++;
    }

    function returnData (address payable _implementation) public view returns(riskSpectrum memory){
        // returns(riskSpectrum memory)
        SplitInsuranceV2 proxy = SplitInsuranceV2(payable(riskSpectrumContracts[_implementation]));   
        //the issue with the previous thign was implementation contract was not initialized
        //how to read from a proxy contract
        ERC20 c = ERC20(proxy.c());
        ERC20 cx = ERC20(proxy.cx());
        ERC20 cy = ERC20(proxy.cy());
        riskSpectrum memory returnsThis;
        returnsThis.c = c.name();
        returnsThis.cx = cx.name();
        returnsThis.cy = cy.name();
        return returnsThis;
    }

//removed the one written by them, to interact with AMM for each RiskSpectrum contact it`s smart contract

}