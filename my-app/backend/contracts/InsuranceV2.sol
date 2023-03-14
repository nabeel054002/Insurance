//aim is to replicate the insurance.sol, but now just include virtual override and aim to deploy using proxy
//the assumption is that c, cx and cy are erc20 compatible


// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "./Tranche.sol";
import "./ITranche.sol";
import "./SplitRiskV2Assist.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

interface IAaveLendingpool {
    function deposit(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external;
    function withdraw(address asset, uint256 amount, address to) external returns (uint256);
}

interface IcDAI is IERC20 {
    function mint(uint256 mintAmount) external returns (uint256);
    function redeem(uint256 redeemTokens) external returns (uint256);
}


contract SplitInsuranceV2{
    /* Internal and external contract addresses  */
    // address public A; // Tranche A token contract
    // address public B; // Tranche A token contract

    SplitRiskV2Assist public AssistContract;

    uint256 public cBalance;

    /* Math helper for decimal numbers */
    uint256 RAY; // Used for floating point math

    address public me;

    /*
      Time controls
      - UNIX timestamps
      - Can be defined globally (here) or relative to deployment time (constructor)
    */

    address public c;
    address x;
    address public cx;
    address public cy;

    address public A;
    address public B;

    uint256 public S;
    uint256 public T1;
    uint256 public T2;
    uint256 public T3;

    bool public initialized = false;
    address public assistContracAddr;
    address[] uniqueUsers;

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

    /* Events */
    event RiskSplit(address indexed splitter, uint256 amount_c);
    event Invest(uint256 amount_c, uint256 amount_cx, uint256 amount_cy, uint256 amount_c_incentive);
    event Divest(uint256 amount_c, uint256 amount_cx, uint256 amount_cy, uint256 amount_c_incentive);
    event Claim(address indexed claimant, uint256 amount_A, uint256 amount_B, uint256 amount_c, uint256 amount_cx, uint256 amount_cy);

    modifier onlyInitialized() {
        require(!initialized, "Contract not initialized");
        initialized = true;
        _;
    }

    function initialize (address _Assist) public onlyInitialized {
        assistContracAddr = _Assist;
        AssistContract = SplitRiskV2Assist(_Assist);
        S = AssistContract.S();
        T1 = AssistContract.T1();
        T2 = AssistContract.T2();
        T3 = AssistContract.T3();
        //USER can create the time for the insurances when it overrides based on the asset
        A = AssistContract.A();
        B = AssistContract.B();

        c = AssistContract.c();//0x6B175474E89094C44Da98b954EedeAC495271d0F; // Maker DAI token
        x = 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9; // Aave v2 lending pool 
        cx = AssistContract.cx();//0x028171bCA77440897B824Ca71D1c56caC55b68A3; // Aave v2 interest bearing DAI (aDAI)  
        cy = AssistContract.cy(); //0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643; // Compound interest bearing DAI (cDAI) 

        me = address(this);

        RAY = 1e27;

        cBalance = 0;
    }


    function proxiableUUID() public pure returns (bytes32) {
        return 0xc5f16f0fcc639fa48a6947836d9850f504798523bf8c9a3a87d5876cf622bcf7;
    }

    function splitRisk(uint256 amount_c) public {
        uint8 user = 0;
        for(uint i=0; i<uniqueUsers.length; i++){
            if(uniqueUsers[i]==msg.sender){
                user = 1;
            }
        }
        if(user==0){
            uniqueUsers.push(msg.sender);
        }
        AssistContract.splitRisk(amount_c, c);
        cBalance +=amount_c;
        emit RiskSplit(msg.sender, amount_c);
    }

    function splitRiskInvestmentPeriod (uint256 amount_c) public virtual{

        //get equivalent balance to be invested 
        uint256 interestDAI = IcDAI(cy).balanceOf(me) + IERC20(cx).balanceOf(me);
        //if function call is made after teh investment call or in an appropriate time then the below function call will take care of it
        uint256 amount_eqvt = (amount_c * interestDAI) / cBalance;//how to round this
        AssistContract.splitRiskInvestmentPeriod(amount_c, c, amount_eqvt);

    }

    function invest() public virtual {
        require(!isInvested, "split: investment was already performed");
        require(block.timestamp >= S, "split: still in issuance period");
        require(block.timestamp < T1, "split: no longer in insurance period");

        IERC20 cToken = IERC20(c);
        cBalance = cToken.balanceOf(me);
        require(cBalance > 0, "split: no c tokens found");
        totalTranches = ITranche(A).totalSupply() * 2;

        if(cBalance%2==1){
            cBalance-=1;
        }

        // Protocol X: Aave
        cToken.approve(x, cBalance / 2);
        IAaveLendingpool(x).deposit(c, cBalance / 2, me, 0);

        // Protocol Y: Compound
        cToken.approve(cy, cBalance/2);
        require(
            IcDAI(cy).mint(cBalance / 2) == 0,
            "split: error while minting cDai"
        );

        isInvested = true;
        emit Invest(cBalance, IERC20(cx).balanceOf(me), IERC20(cy).balanceOf(me), 0);
    }

    function divest() public virtual{
        // Should be incentivized on the first successful call
        require(block.timestamp >= T1, "split: still in insurance period");
        require(block.timestamp < T2, "split: already in claim period");

        IERC20 cToken  = IERC20(c);
        IERC20 cxToken = IERC20(cx);
        IcDAI  cyToken = IcDAI(cy);
        totalTranches = ITranche(A).totalSupply() * 2;
        uint256 halfOfTranches = totalTranches / 2;
        uint256 balance_cx =  cxToken.balanceOf(me);
        uint256 balance_cy =  cyToken.balanceOf(me);
        require (balance_cx > 0 && balance_cy > 0, "split: unable to redeem tokens");
        uint256 interest;

        // Protocol X: Aave
        cBalance = cToken.balanceOf(me);
        IAaveLendingpool(x).withdraw(c, balance_cx, me);
        uint256 withdrawn_x = cToken.balanceOf(me) - cBalance;
        if (withdrawn_x > halfOfTranches) {
            interest += withdrawn_x - halfOfTranches;
        }

        // Protocol Y: Compound
        require(
            cyToken.redeem(balance_cy) == 0,
            "split: unable to redeem cDai"
        );
        uint256 withdrawn_y = cToken.balanceOf(me) - cBalance - withdrawn_x;
        if (withdrawn_y > halfOfTranches) {
            interest += withdrawn_y - halfOfTranches;
        }

        require(cxToken.balanceOf(me) == 0 && cyToken.balanceOf(me) == 0, "split: Error while redeeming tokens");

        // Determine payouts
        inLiquidMode = true;
        cBalance = cToken.balanceOf(me);

        //to export the math to the assist contract
        uint256 [2] memory cPayouts = AssistContract.divestMath(cBalance, totalTranches, interest);
        cPayoutA = cPayouts[0];
        cPayoutB = cPayouts[1];

        emit Divest(cBalance, balance_cx, balance_cy, 0);
        cBalance = IERC20(c).balanceOf(me);
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

    function _claimFallback(uint256 tranches_to_cx, uint256 tranches_to_cy, address trancheAddress) internal{
        AssistContract.claimFallback(tranches_to_cx, tranches_to_cy, address(this), trancheAddress, totalTranches);
        // emit Claim(msg.sender, amount_A, amount_B, 0, payout_cx, payout_cy);
    }

    function claimAll() public {
        uint256 balance_A = ITranche(A).balanceOf(msg.sender);
        uint256 balance_B = ITranche(B).balanceOf(msg.sender);
        require(balance_A > 0 || balance_B > 0, "split: insufficient tranche tokens");
        claim(balance_A, balance_B);
    }

    function claim(uint256 amount_A, uint256 amount_B) public {
        uint256 cBlnce = IERC20(c).balanceOf(me);
        IERC20(c).approve(assistContracAddr, cBlnce);

        AssistContract.claim(amount_A, amount_B, address(this));

        // emit Claim(msg.sender, amount_A, amount_B, payout_c, 0, 0);
    }

}
