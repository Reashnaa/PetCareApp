# Feature: Prepare payment details

## 1. User goal
Pet owners need to view the payment details for a selected pet service before making payment.

## 2. Scope
The feature will show the selected service, price, currency and payment status in JSON format. The server will use prices from a mock service catalogue. No login is needed. It will not charge money, connect to a payment gateway, create database tables or create new EJS pages.

## 3. Request
HTTP method: GET
URL: /payments/prepare/:serviceId
Input: The service ID in the URL.
The server must use the price from the mock service catalogue and ignore any client-supplied amount, including an amount supplied as a query parameter.

## 4. Service catalogue
- ID 1: Vaccination - 35 SGD
- ID 2: Pet Grooming - 50 SGD
- ID 3: Boarding - 80 SGD

## 5. Successful response
HTTP status: 200
The response must contain exactly five JSON fields:
- serviceId: number
- serviceName: string
- amount: number
- currency: string, always "sgd"
- status: string, always "READY_FOR_PAYMENT", meaning the payment details have been prepared but no actual payment has been processed

Example:
{
  "serviceId": 1,
  "serviceName": "Vaccination",
  "amount": 35,
  "currency": "sgd",
  "status": "READY_FOR_PAYMENT"
}

## 6. Unsuccessful response
If the service does not exist, return HTTP 404 with:
{"error":"Service not found"}

## 7. Acceptance criteria
- AC1: Requesting Service ID 1 returns HTTP 200, with serviceId 1, Vaccination, and amount 35.
- AC2: Requesting Service ID 2 returns HTTP 200, with serviceId 2, Pet Grooming, and amount 50.
- AC3: Requesting Service ID 3 returns HTTP 200, with serviceId 3, Boarding, and amount 80.
- AC4: Service ID 999 returns HTTP 404 and {"error":"Service not found"}.
- AC5: Every successful response has exactly five fields with the correct data types, currency "sgd" and status "READY_FOR_PAYMENT".

## 8. Open questions
How should the system handle malformed service IDs? This has not been agreed yet.
