const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Quote", function () {
  async function deploy() {
    const Factory = await ethers.getContractFactory("Quote");
    return Factory.deploy();
  }

  it("returns a pro-rata claim when the investor is inside the sold float", async function () {
    const quote = await deploy();
    // 4/10 of 1000 wei proceeds → 400
    const [claimable, canClaim] = await quote.quote(1000, 4, 10);
    expect(claimable).to.equal(400n);
    expect(canClaim).to.equal(true);
  });

  it("allows a claim that uses the full sold float", async function () {
    const quote = await deploy();
    const [claimable, canClaim] = await quote.quote(1000, 10, 10);
    expect(claimable).to.equal(1000n);
    expect(canClaim).to.equal(true);
  });

  it("still computes a claim amount when shares exceed totalSold, but rejects it", async function () {
    const quote = await deploy();
    // floors 1000 * 11 / 10 = 1100, canClaim = false
    const [claimable, canClaim] = await quote.quote(1000, 11, 10);
    expect(claimable).to.equal(1100n);
    expect(canClaim).to.equal(false);
  });

  it("floors dust toward the vault", async function () {
    const quote = await deploy();
    // 100 * 1 / 3 = 33 remainder 1 stays unclaimed
    const [claimable, canClaim] = await quote.quote(100, 1, 3);
    expect(claimable).to.equal(33n);
    expect(canClaim).to.equal(true);
  });

  it("returns zero and rejects when nothing has been sold", async function () {
    const quote = await deploy();
    const [claimable, canClaim] = await quote.quote(500, 4, 0);
    expect(claimable).to.equal(0n);
    expect(canClaim).to.equal(false);
  });

  it("handles large wei proceeds", async function () {
    const quote = await deploy();
    const proceeds = ethers.parseEther("12.5");
    // 250/1000 of 12.5 ETH → 3.125 ETH
    const [claimable, canClaim] = await quote.quote(proceeds, 250, 1000);
    expect(claimable).to.equal(ethers.parseEther("3.125"));
    expect(canClaim).to.equal(true);
  });

  it("matches the BrickFi API quote for property 1", async function () {
    const url = "http://localhost:4000/api/properties/1/quote?shares=4";
    let response;
    try {
      response = await fetch(url);
    } catch {
      expect.fail("BrickFi API must be running at http://localhost:4000");
    }
    expect(response.ok, "BrickFi API must be running at http://localhost:4000").to.equal(true);

    const body = await response.json();
    const quote = await deploy();
    const [claimable, canClaim] = await quote.quote(
      body.proceeds,
      body.shares,
      body.totalSold
    );
    expect(claimable).to.equal(BigInt(body.claimable));
    expect(canClaim).to.equal(body.canClaim);
  });
});
