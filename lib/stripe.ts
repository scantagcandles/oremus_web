import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing env.STRIPE_SECRET_KEY');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const CURRENCY = 'PLN';
export const MIN_AMOUNT = 100; // 1 PLN
export const MAX_AMOUNT = 1000000; // 10000 PLN

export const formatAmountForDisplay = (amount: number): string => {
  const numberFormat = new Intl.NumberFormat('pl', {
    style: 'currency',
    currency: CURRENCY,
    currencyDisplay: 'symbol',
  });
  return numberFormat.format(amount / 100);
};

export const formatAmountForStripe = (amount: number): number => {
  const numberFormat = new Intl.NumberFormat('pl', {
    style: 'currency',
    currency: CURRENCY,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalAmount = '';
  for (const part of parts) {
    if (part.type !== 'decimal' && part.type !== 'fraction') {
      zeroDecimalAmount += part.value;
    }
  }
  return Number(zeroDecimalAmount);
};
