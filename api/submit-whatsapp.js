const formidable = require('formidable');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const form = formidable({ multiples: true });

    const [fields] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Extract form data
    const tripType = fields['trip-type']?.[0] || fields['trip-type'];
    const fromCity = fields['from-city']?.[0] || fields['from-city'];
    const toCity = fields['to-city']?.[0] || fields['to-city'];
    const departureDate = fields['departure-date']?.[0] || fields['departure-date'];
    const returnDate = fields['return-date']?.[0] || fields['return-date'];
    const phoneNumber = fields['phone-number']?.[0] || fields['phone-number'];
    const passengers = fields['passengers']?.[0] || fields['passengers'];
    const travelClass = fields['travel-class']?.[0] || fields['travel-class'];
    const specialRequests = fields['special-requests']?.[0] || fields['special-requests'];

    // Create WhatsApp message
    let message = `✈️ *Flight Booking Request*\n\n`;
    message += `🎫 *Trip Type:* ${tripType === 'one-way' ? 'One Way' : 'Round Trip'}\n`;
    message += `📍 *From:* ${fromCity}\n`;
    message += `🎯 *To:* ${toCity}\n`;
    message += `📅 *Departure:* ${departureDate}\n`;
    if (returnDate && tripType === 'round-trip') message += `🔄 *Return:* ${returnDate}\n`;
    message += `📞 *Phone:* ${phoneNumber}\n`;
    message += `👥 *Passengers:* ${passengers}\n`;
    message += `💺 *Class:* ${travelClass}\n`;
    if (specialRequests) message += `📝 *Special Requests:* ${specialRequests}\n`;
    message += `\n📸 *Note:* I will attach my Passport and ID photos in the chat.\n`;
    message += `\n🙏 Please provide the best available options and pricing. Thank you!`;

    const whatsappNumber = '251911737373';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    return res.status(200).json({ 
      success: true, 
      whatsappUrl: whatsappUrl,
      message: 'Redirecting to WhatsApp...' 
    });

  } catch (error) {
    console.error('Error processing WhatsApp submission:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to process request. Please try again.' 
    });
  }
}
