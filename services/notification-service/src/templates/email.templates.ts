

/**
 * Email Templates
 */

export const emailTemplates = {
  welcomeEmail: (userName: string) => ({
    subject: '🎉 Welcome to Ecommerce!',
    html: `
      <h2>Welcome, ${userName}!</h2>
      <p>Thanks for signing up. Your account is ready to use.</p>
      <p><a href="https://ecommerce.com">Start shopping</a></p>
    `,
  }),

  orderConfirmation: (orderId: string, items: any[], totalPrice: number) => ({
    subject: `✅ Order Confirmed - #${orderId}`,
    html: `
      <h2>Order Confirmation</h2>
      <p>Order ID: ${orderId}</p>
      <p>Items: ${items.length}</p>
      <p>Total: $${totalPrice}</p>
      <p>We'll send shipping info soon!</p>
    `,
  }),

  paymentReceipt: (paymentId: string, amount: number) => ({
    subject: `💳 Payment Received - ${paymentId}`,
    html: `
      <h2>Payment Received</h2>
      <p>Amount: $${amount}</p>
      <p>Transaction ID: ${paymentId}</p>
      <p>Thank you for your purchase!</p>
    `,
  }),

  orderShipped: (orderId: string, trackingNumber: string) => ({
    subject: `📦 Your order has shipped! - #${orderId}`,
    html: `
      <h2>Your Order is On The Way</h2>
      <p>Order ID: ${orderId}</p>
      <p>Tracking: ${trackingNumber}</p>
      <p><a href="https://track.ecommerce.com/${trackingNumber}">Track shipment</a></p>
    `,
  }),
};