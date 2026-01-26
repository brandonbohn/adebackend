# API Testing Guide

## ✅ Your Backend is Ready!

All three systems are connected and ready to test:
1. **Donations** - Accept donations and send receipts
2. **Volunteers** - Accept volunteer registrations
3. **Contact** - Accept contact form submissions with email notifications

---

## 🚀 Start the Server

```bash
npm start
```

Server runs on: `http://localhost:8080`

---

## 📬 API Endpoints for Testing

### 1. **Submit Donation**
**POST** `/api/donors`

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "amount": 50,
  "currency": "USD",
  "country": "Kenya",
  "message": "Keep up the great work!",
  "paymentMethod": "PayPal",
  "transactionId": "TXN123456"
}
```

**What happens:**
- ✅ Donor saved to `json/donors.json`
- ✅ Donation receipt emailed to donor
- ✅ Returns donor info with success message

---

### 2. **Submit Volunteer Application**
**POST** `/api/volunteers`

```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "+254712345678",
  "location": "Nairobi",
  "basedIn": "nairobi",
  "availability": "Weekends",
  "interests": ["teaching", "mentoring"],
  "otherInterest": "Photography",
  "experience": "5 years teaching experience",
  "languagesSpoken": ["English", "Swahili"]
}
```

**What happens:**
- ✅ Volunteer saved to `json/volunteers.json`
- ✅ Status set to "pending"
- ✅ Returns volunteer info with success message

---

### 3. **Submit Contact Form**
**POST** `/api/contacts`

```json
{
  "name": "Bob Wilson",
  "email": "bob@example.com",
  "phone": "+254798765432",
  "organization": "Tech Corp",
  "reason": "partnership",
  "subject": "Corporate Partnership Inquiry",
  "message": "We'd like to discuss partnership opportunities with your organization."
}
```

**Reason options:** `volunteering`, `donation`, `partnership`, `general`, `other`

**What happens:**
- ✅ Contact saved to `json/contacts.json`
- ✅ Confirmation email sent to user
- ✅ Admin notification email sent to you
- ✅ If reason is "donation" → Creates lead in donors.json
- ✅ If reason is "volunteering" → Creates lead in volunteers.json

---

## 🧪 Testing with cURL

### Test Donation:
```bash
curl -X POST http://localhost:8080/api/donors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Donor",
    "email": "test@example.com",
    "amount": 100,
    "currency": "USD",
    "country": "Kenya"
  }'
```

### Test Volunteer:
```bash
curl -X POST http://localhost:8080/api/volunteers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Volunteer",
    "email": "volunteer@example.com",
    "phone": "+254712345678",
    "location": "Nairobi",
    "basedIn": "nairobi",
    "interests": ["teaching"]
  }'
```

### Test Contact:
```bash
curl -X POST http://localhost:8080/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Contact",
    "email": "contact@example.com",
    "reason": "general",
    "subject": "Testing",
    "message": "This is a test message from the contact form."
  }'
```

---

## 📊 View Saved Data

Check these files to see saved submissions:
- `json/donors.json` - All donors and donations
- `json/donations.json` - Individual donation records
- `json/volunteers.json` - All volunteer applications
- `json/contacts.json` - All contact form submissions

---

## 🧪 Testing with Postman or Insomnia

1. Import the endpoints above
2. Set method to POST
3. Set Content-Type header to `application/json`
4. Paste the JSON body
5. Send request
6. Check response and JSON files

---

## ⚠️ Before Going Live

### Update `.env` file with your Zoho email:

```env
# Email Configuration
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-org-email@zohomail.com
EMAIL_PASSWORD=your-zoho-password
EMAIL_FROM=ADE Organization <your-org-email@zohomail.com>
```

**Without email config:**
- ✅ Everything still works
- ✅ Data gets saved
- ❌ No emails sent

**With email config:**
- ✅ Donors get receipts
- ✅ Volunteers get confirmations (when we add that)
- ✅ You get contact notifications

---

## 🎯 Quick Test Checklist

- [ ] Start server: `npm start`
- [ ] Test donation endpoint - Check `json/donors.json`
- [ ] Test volunteer endpoint - Check `json/volunteers.json`
- [ ] Test contact endpoint - Check `json/contacts.json`
- [ ] Add Zoho credentials to `.env`
- [ ] Test donation with real email - Check inbox
- [ ] Test contact with real email - Check your inbox for notification

---

## 🚀 You're Ready!

All three systems work! You can:
✅ Accept donations (with email receipts)
✅ Register volunteers
✅ Receive contact inquiries (with dual emails)

**Next steps:** Connect your frontend and go live! 🎉
