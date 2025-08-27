export function nightsBetween(checkIn, checkOut) {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const ms = d2 - d1;
  return Math.max(0, Math.round(ms / 86400000));
}

export function applyDiscount(subtotal, offer) {
  if (!offer) return { discounted: subtotal, discountAmount: 0 };
  let discounted = subtotal;
  let discountAmount = 0;
  if (offer.discountType === 'percent') {
    discountAmount = Math.round(subtotal * (offer.value/100));
    discounted = Math.max(0, subtotal - discountAmount);
  } else if (offer.discountType === 'flat') {
    discountAmount = Math.min(subtotal, offer.value);
    discounted = Math.max(0, subtotal - offer.value);
  }
  return { discounted, discountAmount };
}
