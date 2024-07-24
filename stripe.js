// stripe.js
import 'dotenv/config';
import express from 'express';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchGetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import Stripe from 'stripe';


const router = express.Router();

const stripe = Stripe(process.env.STRIPE_PRIVATE_KEY);

// Initialize the DynamoDB client
const ddbClient = new DynamoDBClient({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },
  maxAttempts: 3,
  httpOptions: {
    timeout: 5000
  },
  logger: console,
});

// create new DynamoDB Document client,
// which has a more convenient interface for working with JS objects
const docClient = DynamoDBDocumentClient.from(ddbClient);

// function which takes the input of an items array and returns the product data
async function fetchProductsFromDatabase(items) {

  // map method used to iterate over the items array (the input) and create a key array
  const keys = items.map(item => ({ product_id: item.id }));

  // params object is used to pass the DynamoDB keys and the table name
  // this will then be passed to the BatchGetCommand
  const params = {
    RequestItems: {
      'MurkySonicsProducts': {
        Keys: keys,
        // ProjectionExpression is a string that identifies the attributes you want.
        ProjectionExpression: 'product_id, product_name, product_size, price_in_pence'
      },
    },
  };

  try {
    const { Responses } = await docClient.send(new BatchGetCommand(params));

    // Extract the responses for the specific table
    const responses = Responses['MurkySonicsProducts'];

    // new map used to associate the product id with the originalquantity
    const quantitiesById = new Map(items.map(item => [item.id, item.quantity]));

    // Map the responses to the desired structure
    return responses.map(response => ({
      productId: response.product_id,
      quantity: quantitiesById.get(response.product_id),
      productName: response.product_name,
      productSize: response.product_size,
      priceInPence: response.price_in_pence,
    }));

  } catch (error) {
    console.error('Error fetching products from DynamoDB:', error);
    throw error;
  }
}

router.post('/create-checkout-session', async (req, res) => {
    try {
        // productData is an array of product data fetched from dynamodb
        const productData = await fetchProductsFromDatabase(req.body.items);
        console.log(productData);

        let totalAmount = productData.reduce((acc, item) => acc + item.priceInPence * item.quantity, 0);
        let shippingCost = 400;
        if (totalAmount >= 5000){
          shippingCost = 0;
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            allow_promotion_codes: true,
            shipping_address_collection: {
                allowed_countries: ['GB'],
            },
            shipping_options: [{
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: {
                    amount: shippingCost,
                    currency: 'gbp',
                  },
                  display_name: shippingCost === 0 ? 'Free Shipping' : 'Standard Shipping',
                  delivery_estimate: {
                    minimum: {
                      unit: 'business_day',
                      value: 3,
                    },
                    maximum: {
                      unit: 'business_day',
                      value: 5,
                    },
                  },
                },
            }],
            line_items: productData.map(item => {
                return {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: `${item.productName} (Size: ${item.productSize})`,
                            metadata: {
                              size: item.productSize
                            },
                        },
                        unit_amount: item.priceInPence,
                    },
                    quantity: item.quantity
                };
            }),

            // Todo: create success and failure html pages for post checkout
            success_url: `${process.env.SERVER_URL}/index.html`,
            cancel_url: `${process.env.SERVER_URL}/index.html`,
        });
        res.json({ url: session.url });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
        console.log(e);
    }
})

export default router;
