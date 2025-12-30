# Nexus Platform API Documentation

**Base URL:**
* **Local:** `http://localhost:5000/api`
* **Production:** `nexus-one-ivory.vercel.app` 

**Authentication:**
All endpoints (except Login/Register) require a valid JWT Token.
* **Header:** `Authorization: Bearer <your_token_here>`

---

## **1. Authentication**
Manage user access and registration.

### **Register New User**
* **Endpoint:** `POST /auth/register`
* **Description:** Creates a new account (Entrepreneur or Investor).
* **Body:**
  ```json
  {
    "name": "Ali Imran",
    "email": "ali@example.com",
    "password": "securepassword",
    "role": "entrepreneur" // or "investor"
  }

```

* **Response (201 Created):**
```json
{
  "_id": "60d0fe4f5311236168a109ca",
  "name": "Ali Imran",
  "email": "ali@example.com",
  "role": "entrepreneur",
  "token": "eyJhbGciOiJIUzI1NiIsInR..."
}

```



### **Login User**

* **Endpoint:** `POST /auth/login`
* **Description:** Authenticates a user and returns a JWT token.
* **Body:**
```json
{
  "email": "ali@example.com",
  "password": "securepassword"
}

```


* **Response (200 OK):** Returns User object + Token (Same as Register).

---

## **2. Meetings**

Manage scheduling and status updates for video calls.

### **Schedule a Meeting**

* **Endpoint:** `POST /meetings`
* **Description:** Proposes a new meeting with another user.
* **Body:**
```json
{
  "title": "Project Pitch",
  "date": "2025-01-15",
  "time": "10:00 AM",
  "description": "Discussing seed funding.",
  "guestId": "60d0fe4f5311236168a109cb"
}

```



### **Get All Meetings**

* **Endpoint:** `GET /meetings`
* **Description:** Retrieves all meetings associated with the logged-in user.

### **Update Meeting Status**

* **Endpoint:** `PUT /meetings/:id/status`
* **Description:** Accept or Reject a meeting request.
* **Body:**
```json
{
  "status": "accepted" // or "rejected"
}

```



---

## **3. Documents**

Handle legal document uploads and digital signatures.

### **Upload Document**

* **Endpoint:** `POST /documents`
* **Header:** `Content-Type: multipart/form-data`
* **Description:** Uploads a PDF file to the server.
* **Body:** Form Data containing `file` (the PDF) and `title`.

### **Get Documents**

* **Endpoint:** `GET /documents`
* **Description:** Lists all documents uploaded by or shared with the user.

### **Sign Document**

* **Endpoint:** `PUT /documents/:id/sign`
* **Description:** Digitally signs a document (changes status to "Signed").
* **Response (200 OK):**
```json
{
  "_id": "60d0fe...",
  "title": "NDA Agreement",
  "status": "Signed"
}

```



---

## **4. Payments (Wallet)**

Manage deposits and transaction history via Stripe.

### **Create Payment Intent**

* **Endpoint:** `POST /payments/create-payment-intent`
* **Description:** Initiates a Stripe transaction.
* **Body:**
```json
{
  "amount": 50
}

```


* **Response:**
```json
{
  "clientSecret": "pi_3Sk11i..."
}

```



### **Confirm Deposit**

* **Endpoint:** `POST /payments/confirm`
* **Description:** Updates the user's wallet balance after Stripe success.
* **Body:**
```json
{
  "amount": 50,
  "paymentId": "pi_3Sk11i..."
}

```



### **Get Balance**

* **Endpoint:** `GET /payments/balance`
* **Description:** Returns current wallet balance.
* **Response:**
```json
{
  "balance": 150
}

```



### **Get Transaction History**

* **Endpoint:** `GET /payments/history`
* **Description:** Returns a list of all deposits and withdrawals.
* **Response:**
```json
[
  {
    "type": "deposit",
    "amount": 50,
    "status": "completed",
    "createdAt": "2025-12-30T10:00:00.000Z"
  }
]

```



```

```
