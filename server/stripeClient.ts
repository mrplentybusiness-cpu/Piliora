import Stripe from 'stripe';

function getCredentials() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey || !publishableKey) {
    throw new Error('STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY must be set');
  }

  return { publishableKey, secretKey };
}

export async function getUncachableStripeClient() {
  const { secretKey } = getCredentials();
  return new Stripe(secretKey);
}

export async function getStripePublishableKey() {
  const { publishableKey } = getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = getCredentials();
  return secretKey;
}

let stripeSync: any = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();
    const isProduction = process.env.NODE_ENV === 'production';
    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
