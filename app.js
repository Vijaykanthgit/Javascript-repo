const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const itemPrices = {
  item1: 9.0,
  item2: 12.0, 
};

const provTax = {
  ON: 0.13,
  QC: 0.15,
  BC: 0.12,
  AB: 0.05,
  MB: 0.13,
};


app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.ejs');
});


app.post('/submit', (req, res) => {
  const { name, address, city, province, phone, email, quantity1, quantity2 } = req.body;

  let errors = [];

  
  if (!name) errors.push("Name is required.");
  if (!address) errors.push("Address is required.");
  if (!city) errors.push("City is required.");
  if (!province || !provTax[province]) errors.push("Valid province is required.");
  if (!phone || !/^\d{10}$/.test(phone)) errors.push("Phone number must be 10 digits.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Email is invalid.");

  
  const frozentunaqtyNumber = parseInt(quantity1) || 0;
  const freshtunaqtyNumber = parseInt(quantity2) || 0;

  const item1Cost = frozentunaqtyNumber * itemPrices.item1;
  const item2Cost = freshtunaqtyNumber * itemPrices.item2;

  const totalCost = item1Cost + item2Cost;

  if (totalCost < 10) errors.push("Minimum purchase is $10");

  if (errors.length > 0) {
    res.status(400).send(`<h3>Error:</h3><ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>`);
    return;
  }

  
  const tax = totalCost * provTax[province];
  const finalTotal = totalCost + tax;

 
  const receipt = `
  <html>
  <head>
    <style>
      body {
        font-family: 'Arial', sans-serif;
        background-color: #f7f7f7;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        color: #333;
      }

      .receipt-container {
        background-color: white;
        border-radius: 8px;
        padding: 25px;
        max-width: 350px;
        width: 100%;
        margin: 20px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      h2 {
        text-align: center;
        font-size: 22px;
        color: #4CAF50;
        margin-bottom: 15px;
      }

      .receipt-info {
        margin-bottom: 12px;
        font-size: 14px;
      }

      .receipt-info strong {
        font-weight: bold;
        color: #555;
      }

      .receipt-info p {
        color: #333;
      }

      .price {
        color: #4CAF50;
        font-weight: bold;
      }

      .total, .final-total {
        font-size: 16px;
        font-weight: bold;
        margin-top: 10px;
      }

      .final-total {
        color: #ff5722;
      }

      .receipt-info:last-child {
        border-bottom: 2px solid #f4f4f4;
        padding-bottom: 10px;
      }
    </style>
  </head>
  <body>
    <div class="receipt-container">
      <h2>Receipt</h2>
      <div class="receipt-info"><p><strong>Name:</strong> ${name}</p></div>
      <div class="receipt-info"><p><strong>Address:</strong> ${address}</p></div>
      <div class="receipt-info"><p><strong>City:</strong> ${city}</p></div>
      <div class="receipt-info"><p><strong>Province:</strong> ${province}</p></div>
      <div class="receipt-info"><p><strong>Phone:</strong> ${phone}</p></div>
      <div class="receipt-info"><p><strong>Email:</strong> ${email}</p></div>
      <div class="receipt-info"><p><strong>Product 1 (x${frozentunaqtyNumber}):</strong> $${item1Cost.toFixed(2)}</p></div>
      <div class="receipt-info"><p><strong>Product 2 (x${freshtunaqtyNumber}):</strong> $${item2Cost.toFixed(2)}</p></div>
      <div class="receipt-info"><p><strong>Products Total:</strong> $${totalCost.toFixed(2)}</p></div>
      <div class="receipt-info"><p><strong>Sales Tax:</strong> $${tax.toFixed(2)}</p></div>
      <div class="receipt-info"><p><strong>Final Total:</strong> $${finalTotal.toFixed(2)}</p></div>
    </div>
  </body>
  </html>
  `;

  res.send(receipt);
});

app.listen(8080);
