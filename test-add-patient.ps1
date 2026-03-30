$body = @{
    fullName = "Test Patient"
    roomNumber = "ICU-999"
    status = "stable"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3000/api/patients/create" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body `
    -ErrorAction SilentlyContinue

Write-Host "Status Code: $($response.StatusCode)"
Write-Host "Response:"
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
