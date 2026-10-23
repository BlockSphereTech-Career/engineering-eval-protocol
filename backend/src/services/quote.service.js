const { formatEther } = require("ethers");
const contractService = require("./contract.service");
const propertyService = require("./property.service");
const { AppError } = require("./error");

function parseShares(value) {
  const shares = Number(value);
  if (!Number.isInteger(shares) || shares <= 0) {
    throw AppError.validation("shares must be a positive whole number");
  }
  return shares;
}

function protocolClaim(proceeds, shares, totalSold) {
  const vault = BigInt(proceeds);
  const amount = BigInt(shares);
  const sold = BigInt(totalSold);

  if (sold === 0n) {
    return { claimable: 0n, canClaim: false };
  }

  return {
    claimable: (vault * amount) / sold,
    canClaim: amount <= sold,
  };
}

async function quote(propertyId, shareAmount) {
  const property = propertyService.getById(propertyId);
  const shares = parseShares(shareAmount);
  const onChain = await contractService.getOnChainProperty(property.id);

  if (!onChain) {
    throw AppError.conflict("This listing is not live on-chain yet");
  }

  const totalSold = Number(onChain.sharesSold);
  const { claimable, canClaim } = protocolClaim(
    onChain.proceeds,
    shares,
    totalSold
  );

  return {
    propertyId: property.id,
    name: property.name,
    shares,
    proceeds: onChain.proceeds,
    proceedsEth: formatEther(onChain.proceeds),
    totalSold,
    claimable: claimable.toString(),
    claimableEth: formatEther(claimable),
    canClaim,
    message: canClaim
      ? "Claim quote is valid if vault proceeds and the sold float have not changed."
      : totalSold === 0
        ? "No shares sold yet, so the vault has no claim float."
        : "Requested shares exceed the sold float.",
  };
}

async function quoteCart(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw AppError.validation("Cart items are required");
  }

  const lines = [];
  for (const item of items) {
    const line = await quote(item.propertyId, item.shares);
    lines.push({
      ...line,
      image: propertyService.getById(item.propertyId).image,
      location: propertyService.getById(item.propertyId).location,
      tokenSymbol: propertyService.getById(item.propertyId).tokenSymbol,
    });
  }

  const totalClaimable = lines.reduce(
    (sum, line) => sum + BigInt(line.claimable),
    0n
  );
  return {
    items: lines,
    canClaim: lines.every((line) => line.canClaim),
    totalClaimable: totalClaimable.toString(),
    totalClaimableEth: formatEther(totalClaimable),
  };
}

module.exports = {
  quote,
  quoteCart,
  parseShares,
};
