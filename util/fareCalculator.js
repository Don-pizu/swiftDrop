//util/fareCalculator.js

// Fare calculation formula
// totalFare = baseFare + (pricePerKm * distance) * surgeMultiplier
exports.calculateFare = (distanceKm, surgeMultiplier = 1) => {
  const baseFare = 500; // ₦500 base
  const pricePerKm = 200; // ₦200 per kilometer

  const distanceFare = pricePerKm * distanceKm;
  const surgeFee = (baseFare + distanceFare) * (surgeMultiplier - 1);

  const total = baseFare + distanceFare + surgeFee;

  return {
    baseFare,
    distanceFare,
    surgeFee,
    total: Math.round(total) // round to whole Naira
  };
};
