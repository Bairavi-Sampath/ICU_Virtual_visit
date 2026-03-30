#!/bin/bash

# Test the add patient API endpoint
curl -X POST http://localhost:3000/api/patients/create \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Patient","roomNumber":"ICU-999","status":"stable"}' \
  -w "\n"
