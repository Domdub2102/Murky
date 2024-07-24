import 'dotenv/config';
import express from 'express';
import { join } from 'path';

// Importing routes
import emailSignupRouter from './email.js';
import stripeRouter from './stripe.js';

// Create an instance of express
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(join(process.cwd(), 'public')));

//Use the routers for specific routes
app.use('/signup', emailSignupRouter);
app.use('/stripe', stripeRouter);


// Listen on port 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});


