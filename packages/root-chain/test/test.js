var MainContract = artifacts.require("./Main.sol");

contract('Initialization', function(accounts) {

  it("should return answer to universe", function () {
    return MainContract.deployed().then(function(instance) {
      return instance.testCall.call();
    }).then(function(balance) {
      console.log("balance = ", balance);
//      assert.equal(balance.valueOf(), 10000, "10000 wasn't in the first account");
    });

  });



});
