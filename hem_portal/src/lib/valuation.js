export function computeValuation(v) {
  const landArea = parseFloat(v.landAreaSqYds) || 0;
  const landRate = parseFloat(v.landRate) || 0;
  const constructionArea = parseFloat(v.totalConstructionArea) || 0;
  const constructionRate = parseFloat(v.constructionRate) || 0;

  const landAmount = landArea * landRate;
  const constructionAmount = constructionArea * constructionRate;
  const totalValue = landAmount + constructionAmount;

  return { landAmount, constructionAmount, totalValue };
}
