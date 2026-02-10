# Contact Form API Documentation

## Overview

The Contact Form API allows users to submit contact messages through the website. These messages are stored in the database and can be managed by administrators.

## Features

- **Public Submission**: Users can submit contact messages without authentication
- **Validation**: Comprehensive input validation for all fields
- **Admin Management**: Administrators can view, mark as read, and delete messages
- **Status Tracking**: Messages have status: `new`, `read`, `replied`
- **Statistics**: Admin dashboard statistics endpoint

## Database Model

### ContactMessage Schema

```typescript
{
  name: String (required, 2-100 chars)
  email: String (required, valid email)
  phone: String (required, 7-20 chars)
  subject: String (required, 3-200 chars)
  message: String (required, 10-5000 chars)
  status: String ('new' | 'read' | 'replied', default: 'new')
  createdAt: Date
  updatedAt: Date
}
```

## API Endpoints

### 1. Submit Contact Message
**POST** `/api/contact`

**Access**: Public (No authentication required)

**Request Body**:
```json
{
  "name": "Ahmed Mohammed",
  "email": "ahmed@example.com",
  "phone": "+966 50 123 4567",
  "subject": "Project Inquiry",
  "message": "I would like to inquire about your services and previous projects"
}
```

**Validation Rules**:
- `name`: Required, 2-100 characters
- `email`: Required, valid email format
- `phone`: Required, 7-20 characters
- `subject`: Required, 3-200 characters
- `message`: Required, 10-5000 characters

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Ahmed Mohammed",
    "email": "ahmed@example.com",
    "createdAt": "2024-02-10T10:30:00Z"
  }
}
```

**Error Responses**:
- **400**: Validation error (missing or invalid fields)
- **500**: Server error

**Example Request**:
```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "subject": "Service Inquiry",
    "message": "I would like to know more about your construction services"
  }'
```

---

### 2. Get All Contact Messages
**GET** `/api/contact`

**Access**: Admin only (Requires authentication)

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | String | - | Filter by status: `new`, `read`, `replied` |
| `sortBy` | String | `-createdAt` | Sort field (prefix with `-` for descending) |
| `limit` | Number | 10 | Messages per page |
| `page` | Number | 1 | Page number |

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Ahmed",
      "email": "ahmed@example.com",
      "phone": "+966501234567",
      "subject": "Service Inquiry",
      "message": "I would like to know more...",
      "status": "new",
      "createdAt": "2024-02-10T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

**Example Request**:
```bash
# Get new messages
curl -X GET "http://localhost:5000/api/contact?status=new&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get all messages sorted by date
curl -X GET "http://localhost:5000/api/contact?sortBy=-createdAt&page=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. Get Single Contact Message
**GET** `/api/contact/:id`

**Access**: Admin only (Requires authentication)

**URL Parameters**:
- `id`: Contact message ID (MongoDB ObjectId)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Ahmed",
    "email": "ahmed@example.com",
    "phone": "+966501234567",
    "subject": "Service Inquiry",
    "message": "I would like to know more...",
    "status": "read",
    "createdAt": "2024-02-10T10:30:00Z",
    "updatedAt": "2024-02-10T10:35:00Z"
  }
}
```

**Note**: Automatically marks message as `read` if it was `new`

**Error Responses**:
- **400**: Invalid message ID
- **404**: Message not found
- **401**: Unauthorized

**Example Request**:
```bash
curl -X GET http://localhost:5000/api/contact/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 4. Update Message Status
**PATCH** `/api/contact/:id`

**Access**: Admin only (Requires authentication)

**Request Body**:
```json
{
  "status": "replied"
}
```

**Valid Status Values**: `new`, `read`, `replied`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Message status updated",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "status": "replied",
    "updatedAt": "2024-02-10T11:00:00Z"
  }
}
```

**Error Responses**:
- **400**: Invalid status value
- **401**: Unauthorized
- **404**: Message not found

**Example Request**:
```bash
curl -X PATCH http://localhost:5000/api/contact/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "replied"}'
```

---

### 5. Delete Contact Message
**DELETE** `/api/contact/:id`

**Access**: Admin only (Requires authentication)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Contact message deleted successfully"
}
```

**Error Responses**:
- **400**: Invalid message ID
- **401**: Unauthorized
- **404**: Message not found

**Example Request**:
```bash
curl -X DELETE http://localhost:5000/api/contact/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 6. Get Contact Statistics
**GET** `/api/contact/stats/overview`

**Access**: Admin only (Requires authentication)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total": 25,
    "newMessages": 5,
    "byStatus": {
      "new": 5,
      "read": 15,
      "replied": 5
    }
  }
}
```

**Example Request**:
```bash
curl -X GET http://localhost:5000/api/contact/stats/overview \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Authentication

Admin endpoints require a valid JWT token in the `Authorization` header:

```
Authorization: Bearer <JWT_TOKEN>
```

### Getting Admin Token

1. Login with admin credentials:
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@ibnalshaekh.com",
       "password": "Admin123!"
     }'
   ```

2. Use the returned token in subsequent requests:
   ```bash
   curl -X GET http://localhost:5000/api/contact \
     -H "Authorization: Bearer <TOKEN_FROM_RESPONSE>"
   ```

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not found |
| 500 | Server error |

---

## Field Validation

### Name
- **Min length**: 2 characters
- **Max length**: 100 characters
- **Required**: Yes
- **Example**: "Ahmed Mohammed", "علي أحمد"

### Email
- **Format**: Valid email address
- **Required**: Yes
- **Example**: "ahmed@example.com", "ali@ibnalshaekh.com"

### Phone
- **Min length**: 7 characters
- **Max length**: 20 characters
- **Required**: Yes
- **Example**: "+966 50 123 4567", "+966501234567"

### Subject
- **Min length**: 3 characters
- **Max length**: 200 characters
- **Required**: Yes
- **Example**: "Project Inquiry", "استفسار حول الخدمات"

### Message
- **Min length**: 10 characters
- **Max length**: 5000 characters
- **Required**: Yes
- **Example**: "I would like to inquire about your construction services"

---

## Frontend Integration

### React Component Example

```typescript
import { apiService } from './services/api';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.submitContactMessage(formData);
      alert('Message sent successfully!');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Your Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Your Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />
      <input
        type="tel"
        name="phone"
        placeholder="Phone Number"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        required
      />
      <input
        type="text"
        name="subject"
        placeholder="Subject"
        value={formData.subject}
        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        required
      />
      <textarea
        name="message"
        placeholder="Your Message"
        value={formData.message}
        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
        required
      />
      <button type="submit">Send Message</button>
    </form>
  );
};

export default ContactForm;
```

---

## Rate Limiting

Currently, there is no rate limiting on the contact endpoint. For production, consider implementing rate limiting to prevent spam.

---

## Future Enhancements

1. **Email Notifications**: Send confirmation email to user
2. **Admin Email Alerts**: Notify admin of new messages
3. **Rate Limiting**: Prevent spam submissions
4. **File Attachments**: Allow users to upload files
5. **Custom Fields**: Allow admins to add custom fields
6. **Auto-replies**: Send automatic response to users
7. **Categories**: Categorize inquiries by type
8. **Priority Levels**: Set message priority

---

## Testing

### Using Postman

1. Create a new POST request to: `http://localhost:5000/api/contact`
2. Set Content-Type header to: `application/json`
3. Paste this JSON in the body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "phone": "+966501234567",
  "subject": "Test Subject",
  "message": "This is a test message for the contact form API"
}
```

4. Click Send
5. You should receive a 201 response with the message ID

---

## Support

For issues or questions about the Contact API:
1. Check validation messages in error responses
2. Verify all required fields are provided
3. Check MongoDB connection
4. Review server logs
5. Check CORS settings if testing from frontend

