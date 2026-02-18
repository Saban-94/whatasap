export function calculateLogistics(items: any[]) {
  let totalWeight = 0;
  let hasBale = false;

  items.forEach(item => {
    if (item.name.includes("בלה") || item.name.includes("סומסום")) hasBale = true;
    if (item.name.includes("מלט")) totalWeight += (item.qty * 25);
    if (item.name.includes("לוח")) totalWeight += (item.qty * 30);
  });

  const needsCrane = hasBale || totalWeight > 2000;
  let truckType = "משאית קלה (עלי)";
  
  if (totalWeight > 5500) truckType = "משאית כבדה + מנוף";
  if (hasBale && truckType === "משאית קלה (עלי)") {
    return { error: "לא ניתן להעמיס בלות על משאית קלה ללא מנוף!" };
  }

  return { truckType, needsCrane, totalWeightKg: totalWeight };
}
