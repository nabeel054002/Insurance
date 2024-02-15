//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.1;

import "./ITranche.sol";
import "./Tranche.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./InsuranceV2.sol";
import "hardhat/console.sol";

contract SplitRiskV2Assist {
    
    uint256 public S;
    uint256 public T1;
    uint256 public T2;
    uint256 public T3;

    address public A;
    address public B;

    address public c;
    address public cx;
    address public cy;

    uint256 constant RAY = 10**27;

    uint256 cPayoutA;
    uint256 cPayoutB;

    uint256 cxPayout;
    uint256 cyPayout;

    constructor (address _c, address _cx, address _cy) {
        S = block.timestamp + 50; // +3 minutes// add T1, T2, T3 as the input
        T1 = S + 50; // +6minutes
        T2 = T1 + 50; // +2minutes
        T3 = T2 + 50; // +3minutes

        A = address(new Tranche("Tranche A", "A"));
        B = address(new Tranche("Tranche B", "B"));

        c = _c;
        cx = _cx;
        cy = _cy;
    }

    function splitRiskfn(uint256 amount_c, address _c) public{
        require(block.timestamp < S, "split: no longer in issuance period");
        require(amount_c > 1, "split: amount_c too low");

        if (amount_c % 2 != 0) {
            // Only accept even denominations
            amount_c -= 1;
        }
        console.log("idhar tak theek hai");
        require(
            IERC20(c).transferFrom(tx.origin, msg.sender, amount_c),
            "split: failed to transfer c tokens"
        );

        ITranche(A).mint(tx.origin, amount_c / 2);
        ITranche(B).mint(tx.origin, amount_c / 2);
    }
    //assume the above works fine

    function splitRiskInvestmentPeriod(uint amount_c, address c, uint amount_eqvt) public {
        require(block.timestamp >= S, "split: still in issuance period");
        require(block.timestamp < T1, "split: no longer in investment period");
        require(amount_c > 1, "split: amount_c too low");

        require(
            IERC20(c).transferFrom(tx.origin, msg.sender, amount_c),
            "split: failed to transfer c tokens"
        );

        ITranche(A).mint(tx.origin, amount_eqvt);
        ITranche(B).mint(tx.origin, amount_eqvt);
    }

    function divestMath (uint256 balance_c, uint256 totalTranches, uint256 interest) public returns (uint256 [2] memory cPayouts) {
        uint256 halfOfTranches = totalTranches / 2;
        if (balance_c >= totalTranches) {
            // No losses, equal split of all c among A/B shares
            cPayoutA = RAY * balance_c / totalTranches;
            cPayoutB = cPayoutA;
        } else if (balance_c > halfOfTranches) {
            // Balance covers at least the investment of all A shares
            cPayoutA = RAY * interest / halfOfTranches + RAY; // A tranches fully covered and receive all interest
            cPayoutB = RAY * (balance_c - halfOfTranches - interest) / halfOfTranches;
        } else {
            // Greater or equal than 50% loss
            cPayoutA = RAY * balance_c / halfOfTranches; // Divide recovered assets among A
            cPayoutB = 0; // Not enough to cover B
        }//is inliquidmode, and there will be different cases, of losses or so, and this will be able to set the payouts

        return [cPayoutA, cPayoutB];
    }

    function claim(uint256 amount_A, uint256 amount_B, address payable addr) public {
        SplitInsuranceV2 tempInsurance = SplitInsuranceV2(addr);
        bool isInvested = tempInsurance.isInvested();
        bool inLiquidMode = tempInsurance.inLiquidMode();
        if (!inLiquidMode) {
            if(!isInvested && block.timestamp >= T1) {
                // If invest was never called, activate liquid mode for redemption
                inLiquidMode = true;
            } else {
                if (block.timestamp < T1) {
                    revert("split: can not claim during insurance period");
                } else if (block.timestamp < T2) {
                    revert("split: call divest() first");
                } else {
                    revert("split: use claimA() or claimB() instead");
                }
            }
        }
        require(amount_A > 0 || amount_B > 0, "split: amount_A or amount_B must be greater than zero");
        uint256 payout_c;

        if (amount_A > 0) {
            ITranche tranche_A = ITranche(A);
            require(tranche_A.balanceOf(tx.origin) >= amount_A, "split: insufficient tranche A tokens");
            tranche_A.burn(tx.origin, amount_A);
            payout_c += cPayoutA * amount_A / RAY;//cpayoutA
        }

        if (amount_B > 0) {
            ITranche tranche_B = ITranche(B);
            require(tranche_B.balanceOf(tx.origin) >= amount_B, "split: insufficient tranche B tokens");
            tranche_B.burn(tx.origin, amount_B);
            payout_c += cPayoutB * amount_B / RAY;//cpayoutA and cpayoutB are the payouts for each tranche A and B respectively
        }

        if (payout_c > 0) {
            IERC20(c).transferFrom(msg.sender, tx.origin, payout_c);
        }
    }

    function claimFallback(uint256 tranches_to_cx, uint256 tranches_to_cy, address addr, address trancheAddress, uint256 totalTranches) public {

        require(tranches_to_cx > 0 || tranches_to_cy > 0, "split: to_cx or to_cy must be greater than zero");

        ITranche tranche = ITranche(trancheAddress);
        require(tranche.balanceOf(tx.origin) >= tranches_to_cx + tranches_to_cy, "split: sender does not hold enough tranche tokens");

        uint256 amount_A;
        uint256 amount_B;
        if (trancheAddress == A) {
            amount_A = tranches_to_cx + tranches_to_cy;
        } else if (trancheAddress == B) {
            amount_B = tranches_to_cx + tranches_to_cy;
        }

        // Payouts
        uint256 payout_cx;
        uint256 payout_cy;
        if (tranches_to_cx > 0) {
            IERC20 cxToken = IERC20(cx);

            // Initialize cx split, only on first call
            if (cxPayout == 0) {
                cxPayout = RAY * cxToken.balanceOf(addr) / totalTranches / 2;
            }

            tranche.burn(tx.origin, tranches_to_cx);
            payout_cx = tranches_to_cx * cxPayout / RAY;
            cxToken.transferFrom(msg.sender, tx.origin, payout_cx);
        }

        if (tranches_to_cy > 0) {
            IERC20 cyToken = IERC20(cy);

            // Initialize cy split, only on first call
            if (cyPayout == 0) {
                cyPayout = RAY * cyToken.balanceOf(addr) / totalTranches / 2;
            }

            tranche.burn(tx.origin, tranches_to_cy);
            payout_cy =  tranches_to_cy * cyPayout / RAY;
            cyToken.transferFrom(msg.sender, tx.origin, payout_cy);
        }
    }

}