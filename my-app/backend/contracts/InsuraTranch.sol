// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "./Tranche.sol";
import "./ITranche.sol";

interface IAaveLendingpool {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

interface IcDAI is IERC20 {
    function mint(uint256 mintAmount) external returns (uint256);
    function redeem(uint256 redeemTokens) external returns (uint256);
}


/*
For variable descriptions, see paper.
c = Dai (Maker DAI)
x = Aave protocol (cx = aDAI)
y = Compound protocol (cy = cDAI)
*/
contract InsuraTranch is Initializable{

    //the initializer function is that for the parent contrat, be sure to read it in https://docs.openzeppelin.com/upgrades-plugins/1.x/writing-upgradeable

    /* Internal and external contract addresses  */
    address public A; // Tranche A token contract
    address public B; // Tranche B token contract

    address public  c;
    address public  x;
    address public cx;
    address public cy;

    /* Math helper for decimal numbers */
    uint256 constant RAY = 1e27; // Used for floating point math

    //the values are being set in initialize function, but to be sure that it can only be called once i have added the bool condition
    uint256 public S;
    uint256 public T1;
    uint256 public T2;
    uint256 public T3;

    /* State tracking */
    uint256 public totalTranches; // Total A + B tokens
    bool public isInvested; // True if c has been deposited for cx and cy
    bool public inLiquidMode; // True: distribute c , False: xc/cy tokens claimable

    /* Liquid mode */
    uint256 public cPayoutA; // Payout in c tokens per A tranche, after dividing by RAY
    uint256 public cPayoutB; // Payout in c tokens per B tranche, after dividing by RAY

    /* Fallback mode */
    uint256 public cxPayout; // Payout in cx tokens per (A or B) tranche, after dividing by RAY
    uint256 public cyPayout; // Payout in cy tokens per (A or B) tranche, after dividing by RAY

    bool initialized = false;

    /* Events */
    event RiskSplit(address indexed splitter, uint256 amount_c);
    event Invest(uint256 amount_c, uint256 amount_cx, uint256 amount_cy, uint256 amount_c_incentive);
    event Divest(uint256 amount_c, uint256 amount_cx, uint256 amount_cy, uint256 amount_c_incentive);
    event Claim(address indexed claimant, uint256 amount_A, uint256 amount_B, uint256 amount_c, uint256 amount_cx, uint256 amount_cy);


    function initialize (uint256 _S, uint256 _T1,  uint256 _T2, uint256 _T3, address _c, address _x, address _cx, address _cy) public onlyInitializing {
        A = address(new Tranche("Tranche A", "A"));
        B = address(new Tranche("Tranche B", "B"));
        S = _S;
        T1 = _T1;
        T2 = _T2;
        T3 = _T3;
        c = _c;
        x = _x;
        cx = _cx;
        cy = _cy;
    }

    function proxiableUUID() public pure returns (bytes32) {
        return 0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7;
    }

    function splitRisk(uint256 amount_c) public {
        require(block.timestamp < S, "split: no longer in issuance period");
        require(amount_c > 1, "split: amount_c too low");

        if (amount_c % 2 != 0) {
            // Only accept even denominations
            amount_c -= 1;
        }

        require(
            IERC20(c).transferFrom(msg.sender, address(this), amount_c),
            "split: failed to transfer c tokens"
        );//the transferfrom function is not native to a token like c

        ITranche(A).mint(msg.sender, amount_c / 2);
        ITranche(B).mint(msg.sender, amount_c / 2);

        emit RiskSplit(msg.sender, amount_c);
    }

    function invest() public {
        require(!isInvested, "split: investment was already performed");
        require(block.timestamp >= S, "split: still in issuance period");
        require(block.timestamp < T1, "split: no longer in insurance period");

        address me = address(this);
        IERC20 cToken = IERC20(c);
        uint256 balance_c = cToken.balanceOf(me);
        require(balance_c > 0, "split: no c tokens found");
        totalTranches = ITranche(A).totalSupply() * 2;

        //Invest in both the protocols X and Y
        investInXandY(balance_c);

        isInvested = true;
        emit Invest(balance_c, IERC20(cx).balanceOf(me), IERC20(cy).balanceOf(me), 0);
    }

    function investInXandY (uint256 balance_c) internal virtual{
        // Protocol X: Aave
        IERC20(c).approve(x, balance_c);
        IAaveLendingpool(x).deposit(c, balance_c, address(this), 0);

        // Protocol Y: Compound
        IERC20(c).approve(cy, balance_c);
        IcDAI(cy).mint(balance_c);
    }

    function divest() public {
        // Should be incentivized on the first successful call
        require(block.timestamp >= T1, "split: still in insurance period");
        require(block.timestamp < T2, "split: already in claim period");
        IERC20 cToken  = IERC20(c);
        
        uint256 [4] memory arr = divestFromXandY();
        uint256 interest = arr[0];
        uint256 halfOfTranches = arr[1];
        uint256 balance_cx = arr[2];
        uint256 balance_cy = arr[3];

        // Determine payouts
        inLiquidMode = true;
        uint256 balance_c = cToken.balanceOf(address(this));
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

        emit Divest(balance_c, balance_cx, balance_cy, 0);
    }

    function divestFromXandY() internal virtual returns(uint256 [4] memory){
        IERC20 cToken  = IERC20(c);
        IERC20 cxToken = IERC20(cx);
        IcDAI  cyToken = IcDAI(cy);
        address me = address(this);

        uint256 halfOfTranches = totalTranches / 2;
        uint256 balance_cx =  cxToken.balanceOf(me);
        uint256 balance_cy =  cyToken.balanceOf(me);
        require (balance_cx > 0 && balance_cy > 0, "split: unable to redeem tokens");
        uint256 interest;

        // Protocol X: Aave
        uint256 balance_c = cToken.balanceOf(me);
        IAaveLendingpool(x).withdraw(c, balance_cx, me);
        uint256 withdrawn_x = cToken.balanceOf(me) - balance_c;
        if (withdrawn_x > halfOfTranches) {
            interest += withdrawn_x - halfOfTranches;
        }

        // Protocol Y: Compound
        require(
            cyToken.redeem(balance_cy) == 0,
            "split: unable to redeem cDai"
        );
        uint256 withdrawn_y = cToken.balanceOf(me) - balance_c - withdrawn_x;
        if (withdrawn_y > halfOfTranches) {
            interest += withdrawn_y - halfOfTranches;
        }

        require(cxToken.balanceOf(me) == 0 && cyToken.balanceOf(me) == 0, "split: Error while redeeming tokens");

        return [interest, halfOfTranches, balance_cx, balance_cy];
        
    }

    function claimA(uint256 tranches_to_cx, uint256 tranches_to_cy) public {
        if(!isInvested && !inLiquidMode && block.timestamp >= T1) {
            // If invest was never called, activate liquid mode for redemption
            inLiquidMode = true;
        }
        if (inLiquidMode) {
            // Pay out c directly
            claim(tranches_to_cx + tranches_to_cy, 0);//dont exactly need this, since the call will definitely be made 
            return;
        }
        require(block.timestamp >= T2, "split: claim period for A tranches not active yet");
        _claimFallback(tranches_to_cx, tranches_to_cy, A);
    }

    function claimB(uint256 tranches_to_cx, uint256 tranches_to_cy) public {
        if(!isInvested && !inLiquidMode && block.timestamp >= T1) {
            // If invest was never called, activate liquid mode for redemption
            inLiquidMode = true;
        }
        if (inLiquidMode) {
            // Pay out c directly
            claim(0, tranches_to_cx + tranches_to_cy);
            return;
        }
        require(block.timestamp >= T3, "split: claim period for B tranches not active yet");
        _claimFallback(tranches_to_cx, tranches_to_cy, B);
    }

    function _claimFallback(uint256 tranches_to_cx, uint256 tranches_to_cy, address trancheAddress) internal {
        require(tranches_to_cx > 0 || tranches_to_cy > 0, "split: to_cx or to_cy must be greater than zero");

        ITranche tranche = ITranche(trancheAddress);
        require(tranche.balanceOf(msg.sender) >= tranches_to_cx + tranches_to_cy, "split: sender does not hold enough tranche tokens");

        uint256 amount_A;
        uint256 amount_B;
        if (trancheAddress == A) {
            amount_A = tranches_to_cx + tranches_to_cy;
        } else if (trancheAddress == B) {
            amount_B = tranches_to_cx + tranches_to_cy;
        }

        uint256[2] memory arr = _payoutsFallback(tranches_to_cx, tranches_to_cy, trancheAddress);

        emit Claim(msg.sender, amount_A, amount_B, 0, arr[0], arr[1]);
    }
    function _payoutsFallback(uint256 tranches_to_cx,  uint256 tranches_to_cy, address trancheAddress) internal virtual returns (uint256 [2]memory ){
        
        //the need to make this function as overriden is because of the case the existence of transfer function 
        //and maybe the declaration of the wrapped tokens to be IERC20 or so...
        
        // Payouts
        uint256 payout_cx;
        uint256 payout_cy;
        ITranche tranche = ITranche(trancheAddress);
        if (tranches_to_cx > 0) {
            IERC20 cxToken = IERC20(cx);

            // Initialize cx split, only on first call
            if (cxPayout == 0) {
                cxPayout = RAY * cxToken.balanceOf(address(this)) / totalTranches / 2;
            }

            tranche.burn(msg.sender, tranches_to_cx);
            payout_cx = tranches_to_cx * cxPayout / RAY;
            cxToken.transfer(msg.sender, payout_cx);
        }

        if (tranches_to_cy > 0) {
            IERC20 cyToken = IERC20(cy);

            // Initialize cy split, only on first call
            if (cyPayout == 0) {
                cyPayout = RAY * cyToken.balanceOf(address(this)) / totalTranches / 2;
            }

            tranche.burn(msg.sender, tranches_to_cy);
            payout_cy =  tranches_to_cy * cyPayout / RAY;
            cyToken.transfer(msg.sender, payout_cy);
        }

        return [payout_cx, payout_cy];
    }

    /// @notice Redeem **all** owned A- and B-tranches for Dai
    /// @dev    Only available in liquid mode
    function claimAll() public {
        uint256 balance_A = ITranche(A).balanceOf(msg.sender);
        uint256 balance_B = ITranche(B).balanceOf(msg.sender);
        require(balance_A > 0 || balance_B > 0, "split: insufficient tranche tokens");
        claim(balance_A, balance_B);
    }

    function claim(uint256 amount_A, uint256 amount_B) public {
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
            require(tranche_A.balanceOf(msg.sender) >= amount_A, "split: insufficient tranche A tokens");
            tranche_A.burn(msg.sender, amount_A);
            payout_c += cPayoutA * amount_A / RAY;//cpayoutA
        }

        if (amount_B > 0) {
            ITranche tranche_B = ITranche(B);
            require(tranche_B.balanceOf(msg.sender) >= amount_B, "split: insufficient tranche B tokens");
            tranche_B.burn(msg.sender, amount_B);
            payout_c += cPayoutB * amount_B / RAY;//cpayoutA and cpayoutB are the payouts for each tranche A and B respectively
        }

        if (payout_c > 0) {
            IERC20(c).transfer(msg.sender, payout_c);
        }

        emit Claim(msg.sender, amount_A, amount_B, payout_c, 0, 0);
    }

}
