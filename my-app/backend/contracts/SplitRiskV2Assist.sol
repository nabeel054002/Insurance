//SPDX-License-Identifier: MIT 
pragma solidity ^0.8.1;

import "./ITranche.sol";
import "./Tranche.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SplitRiskV2Assist {
    
    uint256 public S;
    uint256 public T1;
    uint256 public T2;
    uint256 public T3;

    address public A;
    address public B;

    uint256 constant RAY = 10**27;

    constructor () {
        S = block.timestamp + 60 * 3; // +3 minutes// add T1, T2, T3 as the input
        T1 = S + 60 * 6; // +6minutes
        T2 = T1 + 60 * 2; // +2minutes
        T3 = T2 + 60 * 3; // +3minutes

        A = address(new Tranche("Tranche A", "A"));
        B = address(new Tranche("Tranche B", "B"));
    }

    function splitRisk(uint256 amount_c, address c) public {
        require(block.timestamp < S, "split: no longer in issuance period");
        require(amount_c > 1, "split: amount_c too low");

        if (amount_c % 2 != 0) {
            // Only accept even denominations
            amount_c -= 1;
        }

        require(
            IERC20(c).transferFrom(tx.origin, msg.sender, amount_c),
            "split: failed to transfer c tokens"
        );

        ITranche(A).mint(tx.origin, amount_c / 2);
        ITranche(B).mint(tx.origin, amount_c / 2);
    }

    function divestMath (uint256 balance_c, uint256 totalTranches, uint256 interest) public returns (uint256 [2] memory cPayouts) {
        uint256 cPayoutA;
        uint256 cPayoutB;
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

}