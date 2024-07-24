// email.js
import 'dotenv/config';
import express from 'express';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

const router = express.Router();

const client = new DynamoDBClient({
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

// Email signup route
router.post('/emailVerified', async (req, res) => {

  const email = req.body.email;
  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Email invalid' });
  }
  await putItemIfNotExists(email, res);

});

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

async function putItemIfNotExists(email, res) {

  const params = {
    TableName: 'MurkySonicsEmailList',
    Item: marshall({
      Email: email,
      SubscriberSince: new Date().toISOString()
    }),
    ConditionExpression: "attribute_not_exists(Email)" //ensures email doesnt already exist in the database
  };

  try {
    await client.send(new PutItemCommand(params));
    console.log('item added successfully');
    res.json({ message: 'sign up successful', email: email });
  }
  catch (error) {
    if (error.name === 'ConditionalCheckFailedException') { //error thrown when specified condition fails
      console.log('Item already exists in database');
      res.status(409).json({ error: 'You are already subscribed!' });
    }
    else {
      console.log('error adding item', error);
      res.status(500).json({ error: 'Failed to save the email' });
    }
  }

}

export default router;
