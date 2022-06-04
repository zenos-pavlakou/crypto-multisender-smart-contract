const CryptoMultisender = artifacts.require("CryptoMultisender");
const Token = artifacts.require("Token");
const DeflationaryToken = artifacts.require("DeflationaryToken");
const ERC721Token = artifacts.require("NFTCollectibleERC721");
const ERC1155Token = artifacts.require("NFTCollectibleERC1155");
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
const timeMachine = require('ganache-time-traveler');

contract('CryptoMultisender', function(accounts) {

  it("should allow user to become member for 1 day", function(){
  	var account_one = accounts[1];
  	return CryptoMultisender.new().then(async function(instance){
  		await instance.becomeOneDayMember("",{from: account_one, value: 9e17});
  		return instance.checkIsPremiumMember(account_one);
  	}).then(function(isPremiumMember){
  		assert.equal(isPremiumMember, true, "becomePremiumMember() did not work");
  	})
  })
                         
  it("should allow user to become member for 7 days", function(){
  	var account_one = accounts[1];
  	return CryptoMultisender.new().then(async function(instance){
  		await instance.becomeOneWeekMember("",{from: account_one, value: 125e16});
  		return instance.checkIsPremiumMember(account_one);
  	}).then(function(isPremiumMember){
  		assert.equal(isPremiumMember, true, "becomePremiumMember() did not work");
  	})
  })

  it("should allow user to become member for 1 month", function(){
  	var account_one = accounts[1];
  	return CryptoMultisender.new().then(async function(instance){
  		await instance.becomeOneMonthMember("",{from: account_one, value: 2e18});
  		return instance.checkIsPremiumMember(account_one);
  	}).then(function(isPremiumMember){
  		assert.equal(isPremiumMember, true, "becomePremiumMember() did not work");
  	})
  })

  it("should allow user to become a lifetime member", function(){
  	var account_one = accounts[1];
  	return CryptoMultisender.new().then(async function(instance){
  		await instance.becomeOneMonthMember("",{from: account_one, value: 25e17});
  		return instance.checkIsPremiumMember(account_one);
  	}).then(function(isPremiumMember){
  		assert.equal(isPremiumMember, true, "becomePremiumMember() did not work");
  	})
  })

  it("should revert if member tries to purchase membership", function() {
  	return CryptoMultisender.new().then(async function(instance){
  		await instance.becomeOneDayMember("",{ from: accounts[1], value: 9e17});
		  await truffleAssert.reverts(
  			instance.becomeOneDayMember("",{ from: accounts[1], value: 9e17}),
  			"Is already premiumMember member"
		  );
  	})
  })

  it("should assign correct time for 1 day membership", async function() {
    var account_one = accounts[1];
  	return CryptoMultisender.new().then(async function(instance){
      await instance.becomeOneDayMember("",{ from: accounts[1], value: 9e17});
      let check_1 = await instance.checkIsPremiumMember(account_one);
      await timeMachine.advanceTimeAndBlock(86401);
      let check_2 = await instance.checkIsPremiumMember(account_one);
      return check_1 && !check_2;
    }).then(function(success){
      assert.equal(success, true, "Membership was not revoked after 1 day");
    })
  })

  it("should assign correct time for 7 day membership", function() {
    var account_one = accounts[1];
    return CryptoMultisender.new().then(async function(instance){
      await instance.becomeOneWeekMember("",{ from: accounts[1], value: 125e16});
      let check_1 = await instance.checkIsPremiumMember(account_one);
      await timeMachine.advanceTimeAndBlock(604801);
      let check_2 = await instance.checkIsPremiumMember(account_one);
      return check_1 && !check_2;
    }).then(function(success){
      assert.equal(success, true, "Membership was not revoked after 7 days");
    })
  })

  it("should assign correct time for 1 month membership", function() {
    var account_one = accounts[1];
    return CryptoMultisender.new().then(async function(instance){
      await instance.becomeOneMonthMember("",{ from: accounts[1], value: 2e18});
      let check_1 = await instance.checkIsPremiumMember(account_one);
      await timeMachine.advanceTimeAndBlock((86400*31)+1);
      let check_2 = await instance.checkIsPremiumMember(account_one);
      return check_1 && !check_2;
    }).then(function(success){
      assert.equal(success, true, "Membership was not revoked after 1 month");
    })
  })

  // it("should assign correct time for lifetime membership", function() {
  //   var account_one = accounts[1];
  //   return CryptoMultisender.new().then(async function(instance){
  //     await instance.becomeLifetimeMember("",{ from: accounts[1], value: 25e17});
  //     let check_1 = await instance.checkIsPremiumMember(account_one);
  //     await timeMachine.advanceTimeAndBlock((86400*36500)+1);
  //     let check_2 = await instance.checkIsPremiumMember(account_one);
  //     return check_1 && !check_2;
  //   }).then(function(success){
  //     assert.equal(success, true, "Membership was not revoked after 1 month");
  //   })
  // })

  it("should correctly apply discount for 1 day membership", function() {
    return CryptoMultisender.new().then(async function(instance){
      await instance.setPremiumMembershipDiscount(accounts[1],50,{ from: accounts[0], value: 0});
      await instance.becomeOneDayMember("",{ from: accounts[1], value: (9e17/2)});
      return await instance.checkIsPremiumMember(accounts[1])
    }).then(function(success){
      assert.equal(success, true, "Discount on 1 day membership failed");
    })
  })

  it("should correctly apply discount for 7 day membership", function() {
    return CryptoMultisender.new().then(async function(instance){
      await instance.setPremiumMembershipDiscount(accounts[1],50,{ from: accounts[0], value: 0});
      await instance.becomeOneWeekMember("",{ from: accounts[1], value: (125e16/2)});
      return await instance.checkIsPremiumMember(accounts[1])
    }).then(function(success){
      assert.equal(success, true, "Discount on 7 day membership failed");
    })
  })

  it("should correctly apply discount for 1 month membership", function() {
    return CryptoMultisender.new().then(async function(instance){
      await instance.setPremiumMembershipDiscount(accounts[1],50,{ from: accounts[0], value: 0});
      await instance.becomeOneMonthMember("",{ from: accounts[1], value: (2e18/2)});
      return await instance.checkIsPremiumMember(accounts[1])
    }).then(function(success){
      assert.equal(success, true, "Discount on 1 month membership failed");
    })
  })

  it("should correctly apply discount for lifetime membership", function() {
    return CryptoMultisender.new().then(async function(instance){
      await instance.setPremiumMembershipDiscount(accounts[1],50,{ from: accounts[0], value: 0});
      await instance.becomeOneMonthMember("",{ from: accounts[1], value: (25e17/2)});
      return await instance.checkIsPremiumMember(accounts[1])
    }).then(function(success){
      assert.equal(success, true, "Discount on lifetime membership failed");
    })
  })

  it("should register correct affiliate code", function(){
    return CryptoMultisender.new().then(async function(instance){
      await instance.addAffiliate(accounts[1],"aff1", 33, {from:accounts[0]});
      let codeRegistered = await instance.affiliateCodeExists.call("aff1");
      return codeRegistered;
    }).then(function(codeRegistered){
      assert.equal(codeRegistered, true, "affiliate code did not register")
    })
  })

  it("should allow owner to add affiliate member", async function(){
    return CryptoMultisender.new().then(async function(instance){
      await instance.addAffiliate(accounts[2],"aff2",33,{from:accounts[0]});
      return instance.isAffiliate.call(accounts[2]);
    }).then(function(isAffiliate){
      assert.equal(isAffiliate, true, "addAffiliate() did not work")
    })
  })

  it("should revert if non-owner tries to add affiliate", function(){
    return CryptoMultisender.new().then(async function(instance){
      await truffleAssert.reverts(
          instance.addAffiliate(accounts[2],"aff2",33, {from:accounts[1]}),
          "Function restricted to owner of contract"
      );
    })
  })

  it("should ensure that the affiliate code is void for non-referred users", function(){
    return CryptoMultisender.new().then(async function(instance){
      await instance.becomeLifetimeMember("",{ from: accounts[2], value: 25e17});
      let affiliateCode = await instance.isAffiliatedWith.call(accounts[2]);
      return affiliateCode;
    }).then(function(affiliateCode){
      assert.equal(affiliateCode,"void","Void affiliate code not assigned");
    })
  })

  it("should ensure that partners are not able to 'jack' commissions from existing users", function(){
    return CryptoMultisender.new().then(async function(instance){
      // await instance.addAffiliate(accounts[2],"aff1",50,{from:accounts[0]});
      await instance.airdropNativeCurrency(
        [
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9",
          "0xff93D1f8f4F612d3078577099e316c03840647E9"
        ],
        [1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000,1000],
        1000*13,"", {from:accounts[3],value:1e18});
      let prevAffBalance = await web3.eth.getBalance(accounts[2]);
      await instance.airdropNativeCurrency(["0xff93D1f8f4F612d3078577099e316c03840647E9"],[100],100,"aff1", {from:accounts[3],value:1e18});
      let currentAffBalance = await web3.eth.getBalance(accounts[2]);
      assert.equal(prevAffBalance, currentAffBalance, "affiliate cheated the system");
   
    })
  })

  it("should not allow affiliate members to be affiliated with themselves", function(){
    return CryptoMultisender.new().then(async function(instance){
      await instance.addAffiliate(accounts[2],"aff1",33,{from:accounts[0]});
      await instance.becomeLifetimeMember("aff1",{from:accounts[2],value:25e17});
      let affCode = await instance.isAffiliatedWith.call(accounts[2]);
      let isAffiliatedWithSelf = await instance.affiliateCodeToAddr.call(affCode) == accounts[2];
      return isAffiliatedWithSelf;
    }).then(function(isAffiliatedWithSelf){
      assert.equal(isAffiliatedWithSelf, false, "affiliate became affiliated with self");
    })
  })

  it("should ensure affiliates get correct commission for new premium member signups", function(){
    return CryptoMultisender.new().then(async function(instance){
      await instance.addAffiliate(accounts[3],"aff3",33,{from:accounts[0]});
      let previousAffiliateBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[3]));
      await instance.becomeLifetimeMember("aff3",{ from: accounts[2], value: 25e17});
      let currentAffiliateBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[3]));
      return parseInt(currentAffiliateBalance.sub(previousAffiliateBalance).toString());
    }).then(function(commissionPaid){
      let fee = new web3.utils.BN("2500000000000000000");
      let percentage = new web3.utils.BN("33");
      let hundred = new web3.utils.BN("100");
      let expected = parseInt(fee.mul(percentage).div(hundred).toString());
      assert.equal(commissionPaid, expected, "Affiliate did not get paid correct commission")
    })
  }) 

  it("should ensure affiliates get correct commission for multi value ETH airdrop", function(){
    return CryptoMultisender.new().then(async function(instance){
      await instance.addAffiliate(accounts[3],"aff3",40,{from:accounts[0]});
      let previousAffiliateBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[3]));
      let drops = 100;
      let recipients = []
      let values = []
      for(let i=0; i<drops; i++) {
        recipients.push("0xff93D1f8f4F612d3078577099e316c03840647E9");
        values.push("10000");
      }
      await instance.airdropNativeCurrency(recipients, values, drops*10000, "aff3", { from: accounts[1], value: 3e18});
      await instance.airdropNativeCurrency(recipients, values, drops*10000, "aff3", { from: accounts[1], value: 3e18});
      let currentAffiliateBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[3]));
      let commisionPaid = parseInt(currentAffiliateBalance.sub(previousAffiliateBalance).toString());
      let dropUnitPrice =  new web3.utils.BN(await instance.dropUnitPrice.call());
      let transfers = new web3.utils.BN(drops.toString());
      let percentage = new web3.utils.BN("40");
      let hundred = new web3.utils.BN("100");
      let saleVal = dropUnitPrice.mul(transfers);
      let expected = parseInt(saleVal.mul(percentage).div(hundred).toString())
      assert.equal(commisionPaid, expected, "Affiliate did not get paid correct commission")
    })
  })

  it("should ensure affiliates get correct commission for multi value token airdrop", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await multisenderInstance.addAffiliate(accounts[3],"aff3",33,{from:accounts[0]});
        await tokenInstance.approve(multisenderInstance.address, "999999999999999999", {from:accounts[0]});
        let previousAffiliateBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[3]));
        let drops = 200;
        let recipients = []
        let values=[]
        for(let i=0; i<drops; i++) {
            recipients.push(accounts[1])
            values.push(1)
        }
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, "200", false, false, "aff3",
          {from: accounts[0], value: 1e18}
        );
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, "200", false, false, "aff3",
          {from: accounts[0], value: 1e18}
        );
        let currentAffiliateBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[3]));
        let commisionPaid = parseInt(currentAffiliateBalance.sub(previousAffiliateBalance).toString());
        let dropUnitPrice =  new web3.utils.BN(await multisenderInstance.dropUnitPrice.call());
        let transfers = new web3.utils.BN(drops.toString());
        let percentage = new web3.utils.BN("33");
        let hundred = new web3.utils.BN("100");
        let saleVal = dropUnitPrice.mul(transfers);
        let expected = parseInt(saleVal.mul(percentage).div(hundred).toString());
        assert.equal(commisionPaid, expected, "Affiliate did not get paid correct commission");
      })
    })
  })

  it("should ensure that ex-affiliates no longer get comissions", function(){
    return CryptoMultisender.new().then(async function(instance){
      await instance.addAffiliate(accounts[3],"aff3",33,{from:accounts[0]});
      let drops = 20;
      let recipients = []
      let values = []
      for(let i=0; i<drops; i++) {
        recipients.push("0xff93D1f8f4F612d3078577099e316c03840647E9");
        values.push("1000");
      }
      await instance.airdropNativeCurrency(recipients, values, 1000*20, "aff3", { from: accounts[1], value: 30e18});
      let previousAffiliateBalance = await web3.eth.getBalance(accounts[3]);
      await instance.removeAffiliate(accounts[3],{from:accounts[0]});
      await instance.airdropNativeCurrency(recipients, values, 1000*20, "aff3", { from: accounts[1], value: 30e18});
      let currentAffiliateBalance = await web3.eth.getBalance(accounts[3]);
      assert.equal(previousAffiliateBalance, currentAffiliateBalance, "Ex-affiliate is still getting paid commission")
    })
  })

  it("should ensure erc20 token airdrop function works", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await tokenInstance.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[0]});
        let acc1 = accounts[1];
        let acc2 = accounts[2];
        let acc3 = accounts[3];
        let acc4 = accounts[4];
        let acc5 = accounts[5];
        await multisenderInstance.becomeLifetimeMember("",{ from: accounts[0], value: 25e17});
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          [acc1,acc2,acc3,acc4,acc5],
          ["700","701","702","703","704"], (700+701+702+703+704),false,false,"",
          {from: accounts[0]}
        );
        assert.equal(await tokenInstance.balanceOf.call(acc1),700,"multi value airdrop did not work");
        assert.equal(await tokenInstance.balanceOf.call(acc2),701,"multi value airdrop did not work");
        assert.equal(await tokenInstance.balanceOf.call(acc3),702,"multi value airdrop did not work");
        assert.equal(await tokenInstance.balanceOf.call(acc4),703,"multi value airdrop did not work");
        assert.equal(await tokenInstance.balanceOf.call(acc5),704,"multi value airdrop did not work");
      })
    })
  })

  it("should ensure multi value ETH drop function works", function(){
    return CryptoMultisender.new().then(async function(instance){
      let acc1 = accounts[1];
      let acc2 = accounts[2];
      let acc3 = accounts[3];
      let acc4 = accounts[4];
      let acc5 = accounts[5];
      let acc1_prevBalance = await web3.eth.getBalance(acc1);
      let acc2_prevBalance = await web3.eth.getBalance(acc2);
      let acc3_prevBalance = await web3.eth.getBalance(acc3);
      let acc4_prevBalance = await web3.eth.getBalance(acc4);
      let acc5_prevBalance = await web3.eth.getBalance(acc5);
      await instance.becomeLifetimeMember("",{ from: accounts[0], value: 25e17});
      await instance.airdropNativeCurrency(
        [acc1,acc2,acc3,acc4,acc5],
        ["1000000000000000000", "2000000000000000000", "3000000000000000000", "4000000000000000000", "5000000000000000000"], 
        (1000000000000000000+2000000000000000000+3000000000000000000+4000000000000000000+5000000000000000000).toString(), "",
        {from: accounts[0], value:1e18*30}
      );
      let acc1_currentBalance = await web3.eth.getBalance(acc1);
      let acc2_currentBalance = await web3.eth.getBalance(acc2);
      let acc3_currentBalance = await web3.eth.getBalance(acc3);
      let acc4_currentBalance = await web3.eth.getBalance(acc4);
      let acc5_currentBalance = await web3.eth.getBalance(acc5);
      assert.equal(parseInt(acc1_prevBalance)+1000000000000000000, parseInt(acc1_currentBalance), "multi value ETH drop did not work");
      assert.equal(parseInt(acc2_prevBalance)+2000000000000000000, parseInt(acc2_currentBalance), "multi value ETH drop did not work");
      assert.equal(parseInt(acc3_prevBalance)+3000000000000000000, parseInt(acc3_currentBalance), "multi value ETH drop did not work");
      assert.equal(parseInt(acc4_prevBalance)+4000000000000000000, parseInt(acc4_currentBalance), "multi value ETH drop did not work");
      assert.equal(parseInt(acc5_prevBalance)+5000000000000000000, parseInt(acc5_currentBalance), "multi value ETH drop did not work");
    })
  })

  it("should ensure tokens listings can be granted", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await multisenderInstance.grantTokenListing(tokenInstance.address, {from:accounts[0]});
        let isListed = await multisenderInstance.checkIsListedToken(tokenInstance.address);
        assert.equal(isListed, true, "Granting of token listing failed");
      })
    })
  })

  it("should ensure granted tokens listings can be revoked", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await multisenderInstance.grantTokenListing(tokenInstance.address, {from:accounts[0]});
        await multisenderInstance.revokeGrantedTokenListing(tokenInstance.address, {from:accounts[0]});
        let isListed = await multisenderInstance.checkIsListedToken(tokenInstance.address);
        assert.equal(isListed, false, "Revoking of granted token listing failed");
      })
    })
  })

  it("should get correct listing fee for tokens", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        let fee = new web3.utils.BN(await multisenderInstance.getListingFeeForToken(tokenInstance.address));
        let expected = new web3.utils.BN("5000000000000000000");
        assert.equal(fee.toString(), expected.toString(), "Does not get the correct fee");
      })
    })
  })

  it("should ensure discounts on token listings work", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await multisenderInstance.setTokenListingFeeDiscount(tokenInstance.address, 50, {from:accounts[0]});
        let fee = new web3.utils.BN(await multisenderInstance.getListingFeeForToken(tokenInstance.address));
        let expected = new web3.utils.BN("2500000000000000000");
        assert.equal(fee.toString(), expected.toString(), "Discount of token listings failed");
      })
    })
  })

  it("should ensure token listings can be purchased", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await multisenderInstance.purchaseTokenListing(tokenInstance.address, "", {from:accounts[0], value:5e18});
        let isListed = await multisenderInstance.checkIsListedToken(tokenInstance.address);
        assert.equal(isListed, true, "Token listing cannot be purchased");
      })
    })
  })

  it("should ensure token listings can be purchased with discount", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await multisenderInstance.setTokenListingFeeDiscount(tokenInstance.address, 50, {from:accounts[0]});
        await multisenderInstance.purchaseTokenListing(tokenInstance.address, "", {from:accounts[0], value:25e17});
        let isListed = await multisenderInstance.checkIsListedToken(tokenInstance.address);
        assert.equal(isListed, true, "Token listing cannot be purchased with discount");
      })
    })
  })

  it("should ensure listed tokens can be airdropped for free", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await multisenderInstance.purchaseTokenListing(tokenInstance.address, "", {from:accounts[0], value:5e18});
        await tokenInstance.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[0]});
        let drops = 100;
        let recipients = []
        let values=[]
        for(let i=0; i<drops; i++) {
          recipients.push(accounts[1])
          values.push(1)
        }
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, "200", false, false, "aff3",
          {from: accounts[0]}
        );
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, "200", false, false, "aff3",
          {from: accounts[0]}
        );
        assert.equal(await tokenInstance.balanceOf.call(accounts[1]),200,"Free airdrop of token with listing failed");
      })
    })
  })

  it("should ensure that funds do not remain in contract when sent with free trial of ERC20 token", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await tokenInstance.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[0]});
        let drops = 100;
        let recipients = []
        let values=[]
        for(let i=0; i<drops; i++) {
          recipients.push(accounts[1])
          values.push(1)
        }
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, "200", false, false, "aff3",
          {from: accounts[0], value:1e18}
        );
        assert.equal(await web3.eth.getBalance(multisenderInstance.address),0,"Failed to refund funds sent with free trial of ERC20 token");
      })
    })
  })



    it("should ensure that funds do not remain in contract when sent with listed ERC20 token", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await multisenderInstance.purchaseTokenListing(tokenInstance.address, "", {from:accounts[0], value:5e18});
        await tokenInstance.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[0]});
        let drops = 100;
        let recipients = []
        let values=[]
        for(let i=0; i<drops; i++) {
          recipients.push(accounts[1])
          values.push(1)
        }
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, "200", false, false, "aff3",
          {from: accounts[0], value:1e18}
        );
        assert.equal(await web3.eth.getBalance(multisenderInstance.address),0,"Failed to refund funds sent with listed ERC20 token");
      })
    })
  })



  it("should ensure that funds do not remain in contract when sent with listed token", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await multisenderInstance.purchaseTokenListing(tokenInstance.address, "", {from:accounts[0], value:5e18});
        await tokenInstance.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[0]});
        let drops = 100;
        let recipients = []
        let values=[]
        for(let i=0; i<drops; i++) {
          recipients.push(accounts[1])
          values.push(1)
        }
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, "200", false, false, "aff3",
          {from: accounts[0], value:1e18}
        );
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, "200", false, false, "aff3",
          {from: accounts[0], value:1e18}
        );
        assert.equal(await web3.eth.getBalance(multisenderInstance.address),0,"Failed to refund funds sent with listed token");
      })
    })
  })

  it("should ensure that new tokens have a free trial", async function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await tokenInstance.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[0]});
        let drops = 200;
        let recipients = []
        let values=[]
        for(let i=0; i<drops; i++) {
          recipients.push(accounts[1])
          values.push(100)
        }
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, 20000, false, false, "aff3",
          {from: accounts[0], value:0}
        );
        let balance = await tokenInstance.balanceOf.call(accounts[1])
        assert.equal(balance.toString(), "20000", "Balance is incorrect");
        await tokenInstance.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[1]});
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, 20000, false, false, "aff3",
          {from: accounts[1], value:1e18}
        );
      })
    })
  })


  it("should ensure that users with free trial can airdrop token without free trial", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        let hasFreeTrial = await multisenderInstance.tokenHasFreeTrial(tokenInstance.address);
        assert.equal(hasFreeTrial,true,"Token does not have free trial");
      })
    })
  })



  it("should ensure that funds do not remain in contract when sent with free trial of user", function(){
    return CryptoMultisender.new().then(async function(instance){
      await instance.airdropNativeCurrency(
        [accounts[1]],
        ["1000000000000000000"], 
        (1000000000000000000).toString(),"",
        {from: accounts[0], value:1e18*30}
      );
      assert.equal(await web3.eth.getBalance(instance.address),0,"Failed to refund funds sent with free trial of user");
    })
  })



  // it("should allow gas optimized token transfer airdrop", function(){
  //   return CryptoMultisender.new().then(async function(multisenderInstance){
  //     return Token.new().then(async function(tokenInstance){
  //       await tokenInstance.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[0]});
  //       await tokenInstance.setMultisenderContractAddress(multisenderInstance.address,{from:accounts[0]});
  //       let values = [];
  //       let addrs = [];
  //       let drops = 500;
  //       for(let i=0; i<drops; i++) {
  //         addrs.push(accounts[1]);
  //         values.push(1);
  //       }
  //       await multisenderInstance.becomeLifetimeMember("",{ from: accounts[0], value: 25e17});
  //       let optimized = await multisenderInstance.erc20Airdrop.estimateGas(
  //         tokenInstance.address,addrs, values, drops, false, true, "",{from: accounts[0]}
  //       );
  //       let normal = await multisenderInstance.erc20Airdrop.estimateGas(
  //         tokenInstance.address,addrs, values, drops, false, false, "",{from: accounts[0]}
  //       );
  //       assert.lessThan(optimized,normal,"optimized does not use less gas");
  //     })
  //   })
  // })


  it("should ensure that ERC721 token airdrop works", function(){
    return CryptoMultisender.new().then(async function(multisenderInstance){
      return ERC721Token.new("/").then(async function(nftInstance){
        await nftInstance.setApprovalForAll(multisenderInstance.address, true, {from:accounts[0]});
        await nftInstance.mintNFTs(10, {from:accounts[0]});
        let tokenIDs = [0,1,2,3,4];
        let addrs = [accounts[1],accounts[2],accounts[3],accounts[4],accounts[5]];
        await multisenderInstance.becomeLifetimeMember("",{ from: accounts[0], value: 25e17});
        await multisenderInstance.erc721Airdrop(nftInstance.address, addrs, tokenIDs, false, "");
        assert.equal(accounts[1], await nftInstance.ownerOf(0));
        assert.equal(accounts[2], await nftInstance.ownerOf(1));
        assert.equal(accounts[3], await nftInstance.ownerOf(2));
        assert.equal(accounts[4], await nftInstance.ownerOf(3));
        assert.equal(accounts[5], await nftInstance.ownerOf(4));
      })
    })
  })




  it("should ensure that ERC721 token airdrop works", function(){
    return CryptoMultisender.new().then(async function(multisenderInstance){
      return ERC721Token.new("/").then(async function(nftInstance){
        await nftInstance.setApprovalForAll(multisenderInstance.address, true, {from:accounts[0]});
        await nftInstance.mintNFTs(10, {from:accounts[0]});
        let tokenIDs = [0,1,2,3,4];
        let addrs = [accounts[1],accounts[2],accounts[3],accounts[4],accounts[5]];
        let previousAffiliateBalance = await web3.eth.getBalance(accounts[3]);
        await multisenderInstance.erc721Airdrop(nftInstance.address, addrs, tokenIDs, false, "",{from:accounts[0],value:1e18});
        let postBalance = await web3.eth.getBalance(accounts[3]);
        assert.equal(previousAffiliateBalance, postBalance);
      })
    })
  })



  it("should ensure that affiliates get correct commission for ERC721 token airdrops", function(){
    return CryptoMultisender.new().then(async function(multisenderInstance){
      return ERC721Token.new("/").then(async function(nftInstance){
        let dropUnitPrice =  new web3.utils.BN(await multisenderInstance.dropUnitPrice.call());
        let commission = new web3.utils.BN("33");
        await multisenderInstance.addAffiliate(
          accounts[3],"aff3",
          parseInt(commission.toString()),
          {from:accounts[0]}
        );
        let previousAffiliateBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[3]));
        let utf8Encode = new TextEncoder();
        calldata = utf8Encode.encode("");
        for(let i=0; i<10; i++){
          await nftInstance.mintNFTs(25, {from:accounts[0]});
        }
        await nftInstance.setApprovalForAll(multisenderInstance.address, true, {from:accounts[0]});
        addrs_1 = []
        ids_1 = []
        for(let i=0; i<150; i++) {
          addrs_1.push(accounts[1]);
          ids_1.push(i);
        }
        await multisenderInstance.erc721Airdrop(nftInstance.address, addrs_1.slice(0,25), ids_1.slice(0,25), false, "aff3",{from:accounts[0],value:1e18});
        await multisenderInstance.erc721Airdrop(nftInstance.address, addrs_1.slice(25,50), ids_1.slice(25,50), false, "aff3",{from:accounts[0],value:1e18});
        await multisenderInstance.erc721Airdrop(nftInstance.address, addrs_1.slice(50,75), ids_1.slice(50,75), false, "aff3",{from:accounts[0],value:1e18});
        await multisenderInstance.erc721Airdrop(nftInstance.address, addrs_1.slice(75,100), ids_1.slice(75,100), false, "aff3",{from:accounts[0],value:1e18});
        addrs = [
          accounts[1],
          accounts[2],
          accounts[3],
          accounts[4]
        ];
        tokenIDs = [151,152,153,154];
        let drops = new web3.utils.BN(addrs.length.toString());
        await multisenderInstance.erc721Airdrop(nftInstance.address, addrs, tokenIDs, false, "aff3",{from:accounts[0],value:1e18});
        let currentAffiliateBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[3]));
        let balanceDifference = parseInt(currentAffiliateBalance.sub(previousAffiliateBalance).toString())
        let expected = dropUnitPrice.mul(drops);
        expected = expected.mul(commission);
        expected = expected.div(new web3.utils.BN("100"));
        expected = parseInt(expected.toString());
        assert.equal(
          balanceDifference, 
          expected,
          "Incorrect commission pad for ERC721 airdrop"
        );
      })
    })
  })


  it("should ensure that funds do not remain in contract when sent with free trial of token", function(){
    return Token.new().then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await multisenderInstance.purchaseTokenListing(tokenInstance.address, "", {from:accounts[0], value:5e18});
        await tokenInstance.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[0]});
        let drops = 100;
        let recipients = []
        let values=[]
        for(let i=0; i<drops; i++) {
          recipients.push(accounts[1])
          values.push(1)
        }
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          recipients,
          values, "200", false, false, "aff3",
          {from: accounts[0], value:1e18}
        );
        assert.equal(await web3.eth.getBalance(multisenderInstance.address),0,"Failed to refund funds sent with free trial of token");
      })
    })
  }) 




  it("should ensure that ERC1155 token airdrop works", function(){
    return CryptoMultisender.new().then(async function(multisenderInstance){
      return ERC1155Token.new("/").then(async function(nftInstance){
        let utf8Encode = new TextEncoder();
        calldata = utf8Encode.encode("");
        await nftInstance.mintBatch(accounts[0], [0,1,2,3], [1,500,200,100], calldata, {from: accounts[0]});
        await nftInstance.setApprovalForAll(multisenderInstance.address, true, {from:accounts[0]});
        await multisenderInstance.becomeLifetimeMember("",{ from: accounts[0], value: 25e17});
        addrs = [accounts[1],accounts[2],accounts[3],accounts[4]];
        tokenIDs = [0,1,2,3];
        amounts = [1,2,3,4];
        assert.equal(0, await nftInstance.balanceOf(accounts[1],0));
        assert.equal(0, await nftInstance.balanceOf(accounts[2],1));
        assert.equal(0, await nftInstance.balanceOf(accounts[3],2));
        assert.equal(0, await nftInstance.balanceOf(accounts[4],3));
        await multisenderInstance.erc1155Airdrop(nftInstance.address, addrs, tokenIDs, amounts, false, "", {from: accounts[0]});
        assert.equal(1, await nftInstance.balanceOf(accounts[1],0));
        assert.equal(2, await nftInstance.balanceOf(accounts[2],1));
        assert.equal(3, await nftInstance.balanceOf(accounts[3],2));
        assert.equal(4, await nftInstance.balanceOf(accounts[4],3));
      })
    })
  })


  it("should ensure that affiliates get correct commission for ERC1155 token airdrops", function(){
    return CryptoMultisender.new().then(async function(multisenderInstance){
      return ERC1155Token.new("/").then(async function(nftInstance){
        let dropUnitPrice =  new web3.utils.BN(await multisenderInstance.dropUnitPrice.call());
        let commission = new web3.utils.BN("33");
        await multisenderInstance.addAffiliate(
          accounts[3],"aff3",
          parseInt(commission.toString()),
          {from:accounts[0]}
        );
        let previousAffiliateBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[3]));
        let utf8Encode = new TextEncoder();
        calldata = utf8Encode.encode("");
        await nftInstance.mintBatch(accounts[0], [0,1,2,3], [1,500,200,100], calldata, {from: accounts[0]});
        await nftInstance.setApprovalForAll(multisenderInstance.address, true, {from:accounts[0]});
        addrs_1 = []
        values_1 = []
        ids_1 = []
        for(let i=0; i<100; i++) {
          addrs_1.push(accounts[1]);
          values_1.push(1);
          ids_1.push(1);
        }
        await multisenderInstance.erc1155Airdrop(nftInstance.address, addrs_1, ids_1, values_1, false, "aff3", {from: accounts[0], value: 25e17});
        addrs = [
          accounts[1],
          accounts[2],
          accounts[3],
          accounts[4]
        ];
        tokenIDs = [0,1,2,3];
        amounts = [1,2,3,4];
        let drops = new web3.utils.BN(amounts.length.toString());
        await multisenderInstance.erc1155Airdrop(nftInstance.address, addrs, tokenIDs, amounts, false, "aff3", {from: accounts[0], value: 25e17});
        let currentAffiliateBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[3]));
        let balanceDifference = parseInt(currentAffiliateBalance.sub(previousAffiliateBalance).toString())
        let expected = dropUnitPrice.mul(drops);
        expected = expected.mul(commission);
        expected = expected.div(new web3.utils.BN("100"));
        expected = parseInt(expected.toString());
        assert.equal(
          balanceDifference, 
          expected,
          "Incorrect commission pad for ERC1155 airdrop"
        );
      })
    })
  })


  it("should ensure that funds do not remain in the contract when sent with free trial of ERC1155 token", function(){
    return CryptoMultisender.new().then(async function(multisenderInstance){
      return ERC1155Token.new("/").then(async function(nftInstance){
        let utf8Encode = new TextEncoder();
        calldata = utf8Encode.encode("");
        await nftInstance.mintBatch(accounts[0], [0,1,2,3], [1,500,200,100], calldata, {from: accounts[0]});
        await nftInstance.setApprovalForAll(multisenderInstance.address, true, {from:accounts[0]});
        addrs = [accounts[1],accounts[2],accounts[3],accounts[4]];
        tokenIDs = [0,1,2,3];
        amounts = [1,2,3,4];
        let previousAffiliateBalance = await web3.eth.getBalance(accounts[3]);
        await multisenderInstance.erc1155Airdrop(nftInstance.address, addrs, tokenIDs, amounts, false, "", {from: accounts[0], value: 1e18});
        let postBalance = await web3.eth.getBalance(accounts[3]);
        assert.equal(previousAffiliateBalance, postBalance);
      })
    })
  })


  it("should ensure that user is charged when sending second new token", function(){
    return Token.new().then(async function(erc20InstanceOne){
      return Token.new().then(async function(erc20InstanceTwo){
        return CryptoMultisender.new().then(async function(multisenderInstance){
          await erc20InstanceOne.transfer(accounts[1], "50000000000000000000", {from:accounts[0]});
          await erc20InstanceTwo.transfer(accounts[1], "50000000000000000000", {from:accounts[0]});
          await erc20InstanceOne.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[1]});
          await erc20InstanceTwo.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[1]});
          let previousOwnerBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[0]));
          let drops = 100;
          let recipients = []
          let values=[]
          for(let i=0; i<drops; i++) {
            recipients.push(accounts[1])
            values.push(1)
          }
          await multisenderInstance.erc20Airdrop(
            erc20InstanceOne.address,
            recipients,
            values, "200", false, false, "",
            {from: accounts[1]}
          );
          await multisenderInstance.erc20Airdrop(
            erc20InstanceTwo.address,
            recipients,
            values, "200", false, false, "",
            {from: accounts[1], value: 1e18}
          );
          let postOwnerBalance = new web3.utils.BN(await web3.eth.getBalance(accounts[0]));
          let dropUnitPrice =  new web3.utils.BN(await multisenderInstance.dropUnitPrice.call());
          let totalDrops = new web3.utils.BN(recipients.length.toString());
          let airdropCost = dropUnitPrice.mul(totalDrops);
          let expectedOwnerBalance = previousOwnerBalance.add(airdropCost);
          assert.equal(postOwnerBalance.toString(),expectedOwnerBalance.toString(),"User was not charged for second new token");
        })
      })
    })
  })

  it("should work with deflationary tokens", function(){
    return DeflationaryToken.new("DEFT2", "DEFT2", 18, "25000000000000000000000000", 1, 1, accounts[0],accounts[0]).then(async function(tokenInstance){
      return CryptoMultisender.new().then(async function(multisenderInstance){
        await tokenInstance.approve(multisenderInstance.address, "50000000000000000000", {from:accounts[0]});
        let acc1 = accounts[1];
        let acc2 = accounts[2];
        let acc3 = accounts[3];
        let acc4 = accounts[4];
        let acc5 = accounts[5];
        // await multisenderInstance.becomeLifetimeMember("",{ from: accounts[0], value: 25e17});
        await multisenderInstance.erc20Airdrop(
          tokenInstance.address,
          [acc1,acc2,acc3,acc4,acc5],
          ["700","701","702","703","704"], (700+701+702+703+703),true,false,"",
          {from: accounts[0]}
        );
        assert.ok(await tokenInstance.balanceOf.call(acc1)>0,"multi value airdrop did not work");
        // assert.equal(await tokenInstance.balanceOf.call(acc2),701,"multi value airdrop did not work");
        // assert.equal(await tokenInstance.balanceOf.call(acc3),702,"multi value airdrop did not work");
        // assert.equal(await tokenInstance.balanceOf.call(acc4),703,"multi value airdrop did not work");
        // assert.equal(await tokenInstance.balanceOf.call(acc5),704,"multi value airdrop did not work");
      })
    })
  })

});
