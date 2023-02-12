// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./Tranche.sol";
import "./ITranche.sol";
import "./InsureAssist.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SplitInsuranceV2 {
    //i am also adding the addresses of the tranche and their functions in the other contract that others will inherit
    uint256 constant RAY = 1e27;
    uint256 public immutable S;
    uint256 public immutable T1;
    uint256 public immutable T2;
    uint256 public immutable T3;

    bool public isInvested; 
    bool public inLiquidMode;
        /* Liquid mode */
    uint256 public cPayoutA; // Payout in c tokens per A tranche, after dividing by RAY
    uint256 public cPayoutB; // Payout in c tokens per B tranche, after dividing by RAY

    /* Fallback mode */
    uint256 public cxPayout; // Payout in cx tokens per (A or B) tranche, after dividing by RAY
    uint256 public cyPayout; // Payout in cy tokens per (A or B) tranche, after dividing by RAY

    /* Events */
    event RiskSplit(address indexed splitter, uint256 amount_c);
    event Invest(uint256 amount_c, uint256 amount_cx, uint256 amount_cy, uint256 amount_c_incentive);
    event Divest(uint256 amount_c, uint256 amount_cx, uint256 amount_cy, uint256 amount_c_incentive);
    event Claim(address indexed claimant, uint256 amount_A, uint256 amount_B, uint256 amount_c, uint256 amount_cx, uint256 amount_cy);

    InsureAssist public immutable insureAssistContract;
    constructor(address _insureAssist) {
        insureAssistContract = InsureAssist(_insureAssist);
        S = insureAssistContract.S;
        T1 = insureAssistContract.T1;
        T2 = insureAssistContract.T2;
        T3 = insureAssistContract.T3;
        IERC20 insuredAsset = insureAssistContract.insuredAsset;
    }

    function splitRisk (uint256 amount_c) public {
        require(block.timestamp < S, "split: no longer in issuance period");
        require(amount_c > 1, "split: amount_c too low");

        if (amount_c % 2 != 0) {
            // Only accept even denominations
            amount_c -= 1;
        }

        mintTranches(amount_c);//what about the transferfrom error and shit?
        emit RiskSplit(msg.sender, amount_c);
    };

    function invest() public {
        require(!isInvested, "split: investment was already performed");
        require(block.timestamp >= S, "split: still in issuance period");
        require(block.timestamp < T1, "split: no longer in insurance period");

        InsureAssist.invest();

        isInvested = true;
        emit Invest(balance_c, IERC20(cx).balanceOf(me), IERC20(cy).balanceOf(me), 0);
    };

    function divest() public {
        // Should be incentivized on the first successful call
        require(block.timestamp >= T1, "split: still in insurance period");
        require(block.timestamp < T2, "split: already in claim period");

        
    };

    function claimA(uint256 tranches_to_cx, uint256 tranches_to_cy) public {};

    function claimB(uint256 tranches_to_cx, uint256 tranches_to_cy) public {};

    function _claimFallback(address claimant, uint256 amount_c) internal {};

    function claimAll() public {};

    function claim(uint256 amount_A, uint256 amount_B) public {};

}