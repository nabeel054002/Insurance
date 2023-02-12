//SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Tranche.sol";
import "./ITranche.sol";

//this contract will hold the assets...?

contract InsureAssist {
    uint256 public immutable S;
    uint256 public immutable T1;
    uint256 public immutable T2;
    uint256 public immutable T3;
    IERC20 insuredAsset;//is this correct?

    address x;//Protocol X
    address y;//Protocol Y

    constructor(uint256 _S, uint256 _T1, uint256 _T2, uint256 _T3, address _insuredAsset, address _x, address _y) {
        S = _S;
        T1 = _T1;
        T2 = _T2;
        T3 = _T3;
        insuredAsset = IERC20(_insuredAsset);
        x = _x;
        y = _y;
    }

    function mintTranches (uint256 amount_c) public {
        //mint tranche A
        //mint tranche B
        require(insuredAsset.transferFrom(tx.origin, address(this), amount_c));

        ITranche(A).mint(tx.origin, amount_c / 2);//time becomes important, because then anyone can mint the tranches and invest
        ITranche(B).mint(tx.origin, amount_c / 2);
    };

    function invest () public virtual override {
        //invest in the asset
        //transfer the asset to the split contract
        //transfer the incentive to the split contract
        uint256 balance_c = insuredAsset.balanceOf(address(this));
        require(balance_c > 0, "insureAssist: no assets to invest");

        //add Methods to Invest in protocols X and Y, to invest balance_c/2 in each protocol
    };
}