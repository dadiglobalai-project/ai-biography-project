# V1 API Contract: Membership, Payments, and Refunds

This document defines the API contract only for the AI Autobiography DIY membership and manual payment flow. It does not define controllers, services, repositories, or database changes.

Unless otherwise stated:

- IDs are `String` UUID values.
- Date/time values are `LocalDateTime` serialized as ISO-8601 strings.
- Money values use `BigDecimal`.
- Users are identified from authentication context, not from request bodies.
- Sensitive plan values such as amount, currency, duration, and refund window are determined by the backend from `membership_plans`.
- Standard error response should follow the existing `ErrorResponse` shape: `status`, `error`, `message`, `timestamp`.

## Shared DTOs

### MembershipPlanResponse

| Field | Java type | Nullable | Notes |
| --- | --- | --- | --- |
| planId | String | No | Plan UUID |
| name | String | No | Example: `DIY Annual Membership` |
| standardPrice | BigDecimal | No | Example: `360.00` |
| currency | String | No | V1 default: `CNY` |
| durationMonths | Integer | No | V1 default: `12` |
| refundWindowDays | Integer | No | V1 default: `7` |
| active | Boolean | No | Whether users may buy this plan |

### MembershipResponse

| Field | Java type | Nullable | Notes |
| --- | --- | --- | --- |
| membershipId | String | Yes | Null when user has no membership |
| plan | MembershipPlanResponse | Yes | Null when user has no membership |
| status | MembershipStatus | No | Use `NONE` when no membership exists |
| startAt | LocalDateTime | Yes | Set after payment confirmation |
| expiresAt | LocalDateTime | Yes | Set after payment confirmation |
| autoRenew | Boolean | No | Future preference flag, not a guarantee of recurring billing |
| active | Boolean | No | Derived from status and expiration |
| daysUntilExpiration | Integer | Yes | Null when not active or no expiration |
| latestPayment | PaymentSummaryResponse | Yes | Optional convenience field |

### PaymentResponse

| Field | Java type | Nullable | Notes |
| --- | --- | --- | --- |
| paymentId | String | No | Payment UUID |
| membershipId | String | No | Associated membership UUID |
| plan | MembershipPlanResponse | No | Purchased plan snapshot from current plan record |
| paymentReference | String | No | Backend-generated reference users place in payment remark |
| amount | BigDecimal | No | Backend-determined amount |
| currency | String | No | Backend-determined currency |
| paymentMethod | PaymentMethod | No | V1: `WECHAT_MANUAL` |
| paymentRemark | String | Yes | User-entered identifying remark |
| status | PaymentStatus | No | Payment lifecycle status |
| paidAt | LocalDateTime | Yes | User-provided or admin-confirmed payment time |
| verifiedBy | String | Yes | Admin user UUID |
| verifiedAt | LocalDateTime | Yes | Verification timestamp |
| createdAt | LocalDateTime | No | Creation timestamp |
| refundable | Boolean | No | Derived for confirmed payments |
| refundDeadlineAt | LocalDateTime | Yes | `paidAt + refundWindowDays`, null if unavailable |
| refund | RefundSummaryResponse | Yes | Present when refund exists |

### PaymentSummaryResponse

Same core fields as `PaymentResponse`, but may omit `plan`, `verifiedBy`, and `refund` for list/current views.

### RefundResponse

| Field | Java type | Nullable | Notes |
| --- | --- | --- | --- |
| refundId | String | No | Refund UUID |
| paymentId | String | No | Refunded payment UUID |
| amount | BigDecimal | No | V1 full amount only |
| currency | String | No | Payment currency |
| reason | String | Yes | User/admin supplied reason |
| status | RefundStatus | No | Refund lifecycle status |
| refundMethod | RefundMethod | Yes | Required when completing manual refund |
| externalRefundReference | String | Yes | Optional bank/WeChat/reference value |
| requestedAt | LocalDateTime | No | Request timestamp |
| processedAt | LocalDateTime | Yes | Set when approved/rejected/completed depending on action |
| processedBy | String | Yes | Admin user UUID |
| payment | PaymentSummaryResponse | No | Associated payment summary |

### RefundSummaryResponse

Same as `RefundResponse`, but may omit nested `payment`.

### PageResponse<T>

| Field | Java type | Nullable | Notes |
| --- | --- | --- | --- |
| items | List<T> | No | Current page items |
| page | Integer | No | Zero-based page index |
| size | Integer | No | Page size |
| totalItems | Long | No | Total matching records |
| totalPages | Integer | No | Total pages |

## Endpoints

### GET /api/membership/current

Purpose:
Returns the authenticated user's current or most recent membership state.

Access:
Authenticated user.

Request DTO:
None.

Response DTO:
`MembershipResponse`.

Example Request:

```http
GET /api/membership/current
Authorization: Bearer <token>
```

Example Response:

```json
{
  "membershipId": "6cfededa-3c84-4c46-8f86-7f0956c75a4b",
  "plan": {
    "planId": "diy-annual",
    "name": "DIY Annual Membership",
    "standardPrice": 360.00,
    "currency": "CNY",
    "durationMonths": 12,
    "refundWindowDays": 7,
    "active": true
  },
  "status": "ACTIVE",
  "startAt": "2026-08-24T10:00:00",
  "expiresAt": "2027-08-24T10:00:00",
  "autoRenew": true,
  "active": true,
  "daysUntilExpiration": 365,
  "latestPayment": {
    "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
    "paymentReference": "DIY-20260824-A8K2Q7",
    "amount": 360.00,
    "currency": "CNY",
    "paymentMethod": "WECHAT_MANUAL",
    "status": "CONFIRMED",
    "createdAt": "2026-08-24T09:48:00"
  }
}
```

Success Status:
`200 OK`.

Possible Errors:

- `401 Unauthorized`: missing or invalid authentication.

Business Rules:

- Membership belongs to the authenticated user, not to a biography website.
- If no membership exists, return `200 OK` with `status: "NONE"`, `active: false`, and nullable membership fields as null.
- Active status should be derived from membership status plus expiration time.
- Expired memberships may be marked `EXPIRED` by scheduled maintenance or derived as inactive at read time.

### GET /api/membership/plans

Purpose:
Lists currently purchasable membership plans.

Access:
Public. Returning only active plans is safe for unauthenticated users.

Request DTO:
None.

Response DTO:
`MembershipPlansResponse`.

- `plans`: `List<MembershipPlanResponse>`, not nullable.

Example Request:

```http
GET /api/membership/plans
```

Example Response:

```json
{
  "plans": [
    {
      "planId": "diy-annual",
      "name": "DIY Annual Membership",
      "standardPrice": 360.00,
      "currency": "CNY",
      "durationMonths": 12,
      "refundWindowDays": 7,
      "active": true
    }
  ]
}
```

Success Status:
`200 OK`.

Possible Errors:

- `500 Internal Server Error`: unexpected backend failure.

Business Rules:

- Return active plans only.
- The frontend may display price and refund window from this endpoint, but must not send price back as an authority.
- V1 should include the DIY annual plan: RMB 360, 12 months, 7-day refund window.

### POST /api/payments

Purpose:
Creates a manual payment request for the authenticated user.

Access:
Authenticated user.

Request DTO:
`CreatePaymentRequest`.

| Field | Java type | Required | Validation | Notes |
| --- | --- | --- | --- | --- |
| planId | String | Yes | `@NotBlank` | Plan to buy |
| paymentMethod | PaymentMethod | Yes | `@NotNull` | V1 only allows `WECHAT_MANUAL` |
| paymentRemark | String | No | `@Size(max = 255)` | User's WeChat username/identifier or intended payment remark |
| autoRenew | Boolean | No | none | Preference only; defaults true |

Response DTO:
`PaymentResponse`.

Example Request:

```json
{
  "planId": "diy-annual",
  "paymentMethod": "WECHAT_MANUAL",
  "paymentRemark": "wechat: li-ming / account email liming@example.com",
  "autoRenew": true
}
```

Example Response:

```json
{
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "membershipId": "6cfededa-3c84-4c46-8f86-7f0956c75a4b",
  "plan": {
    "planId": "diy-annual",
    "name": "DIY Annual Membership",
    "standardPrice": 360.00,
    "currency": "CNY",
    "durationMonths": 12,
    "refundWindowDays": 7,
    "active": true
  },
  "paymentReference": "DIY-20260824-A8K2Q7",
  "amount": 360.00,
  "currency": "CNY",
  "paymentMethod": "WECHAT_MANUAL",
  "paymentRemark": "wechat: li-ming / account email liming@example.com",
  "status": "PENDING",
  "paidAt": null,
  "verifiedBy": null,
  "verifiedAt": null,
  "createdAt": "2026-08-24T09:48:00",
  "refundable": false,
  "refundDeadlineAt": null,
  "refund": null
}
```

Success Status:
`201 Created`.

Possible Errors:

- `400 Bad Request`: invalid DTO, inactive payment method, invalid plan ID format.
- `401 Unauthorized`: missing or invalid authentication.
- `404 Not Found`: plan does not exist or is not available.
- `409 Conflict`: user already has an active membership or an unresolved pending payment for the same plan.

Business Rules:

- User must be authenticated.
- Backend determines `userId` from auth context.
- Plan must exist and be active.
- Backend determines amount, currency, duration, and refund window from the plan.
- Backend generates a unique `paymentReference`.
- A new membership may be created with `PENDING`, linked to the payment.
- A new payment starts as `PENDING`.
- Prevent duplicate pending payment requests when a pending payment for the same user and plan already exists.
- If the user already has an active membership, V1 should reject with `409 Conflict` unless renewal/extension behavior is explicitly added.
- `autoRenew` records a future preference only; no recurring billing is created in V1.

### GET /api/payments/current

Purpose:
Returns the authenticated user's current unresolved payment, or latest payment if no unresolved payment exists.

Access:
Authenticated user.

Request DTO:
None.

Response DTO:
`PaymentResponse`.

Example Request:

```http
GET /api/payments/current
Authorization: Bearer <token>
```

Example Response:

```json
{
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "membershipId": "6cfededa-3c84-4c46-8f86-7f0956c75a4b",
  "plan": {
    "planId": "diy-annual",
    "name": "DIY Annual Membership",
    "standardPrice": 360.00,
    "currency": "CNY",
    "durationMonths": 12,
    "refundWindowDays": 7,
    "active": true
  },
  "paymentReference": "DIY-20260824-A8K2Q7",
  "amount": 360.00,
  "currency": "CNY",
  "paymentMethod": "WECHAT_MANUAL",
  "paymentRemark": "wechat: li-ming / account email liming@example.com",
  "status": "PENDING",
  "paidAt": null,
  "verifiedBy": null,
  "verifiedAt": null,
  "createdAt": "2026-08-24T09:48:00",
  "refundable": false,
  "refundDeadlineAt": null,
  "refund": null
}
```

Success Status:
`200 OK`.

Possible Errors:

- `401 Unauthorized`: missing or invalid authentication.
- `404 Not Found`: user has no payments.

Business Rules:

- User can only see their own payment.
- Prefer returning a `PENDING` payment if one exists.
- If no pending payment exists, return the most recent payment by `createdAt`.
- Do not expose admin-only matching notes in the user response.

### GET /api/payments/{id}

Purpose:
Returns payment details for the authenticated user's payment.

Access:
Authenticated user. Admins should use admin payment endpoints.

Request DTO:
Path variable:

- `id`: `String`, required, payment UUID.

Response DTO:
`PaymentResponse`.

Example Request:

```http
GET /api/payments/15d3ec3f-7954-4c7a-92e9-d436d591356f
Authorization: Bearer <token>
```

Example Response:

```json
{
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "membershipId": "6cfededa-3c84-4c46-8f86-7f0956c75a4b",
  "plan": {
    "planId": "diy-annual",
    "name": "DIY Annual Membership",
    "standardPrice": 360.00,
    "currency": "CNY",
    "durationMonths": 12,
    "refundWindowDays": 7,
    "active": true
  },
  "paymentReference": "DIY-20260824-A8K2Q7",
  "amount": 360.00,
  "currency": "CNY",
  "paymentMethod": "WECHAT_MANUAL",
  "paymentRemark": "wechat: li-ming / account email liming@example.com",
  "status": "CONFIRMED",
  "paidAt": "2026-08-24T09:45:00",
  "verifiedBy": null,
  "verifiedAt": "2026-08-24T10:00:00",
  "createdAt": "2026-08-24T09:48:00",
  "refundable": true,
  "refundDeadlineAt": "2026-08-31T09:45:00",
  "refund": null
}
```

Success Status:
`200 OK`.

Possible Errors:

- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: payment exists but belongs to another user.
- `404 Not Found`: payment does not exist.

Business Rules:

- Normal users can only access their own payments.
- `verifiedBy` may be omitted or null in user-facing responses if admin identity should not be exposed.
- Refund eligibility is derived from status, `paidAt`, and plan refund window.

### GET /api/admin/payments

Purpose:
Lists payments for admin review and payment matching.

Access:
Admin only.

Request DTO:
`AdminPaymentSearchRequest` as query parameters.

| Field | Java type | Required | Validation | Notes |
| --- | --- | --- | --- | --- |
| status | PaymentStatus | No | enum | Filter by status |
| userId | String | No | UUID format if validated | Filter by user |
| paymentReference | String | No | `@Size(max = 100)` | Exact or partial search |
| paymentMethod | PaymentMethod | No | enum | Filter by method |
| createdFrom | LocalDateTime | No | none | Inclusive |
| createdTo | LocalDateTime | No | none | Inclusive |
| page | Integer | No | `@Min(0)` | Default `0` |
| size | Integer | No | `@Min(1) @Max(100)` | Default `20` |

Response DTO:
`AdminPaymentPageResponse` extends `PageResponse<AdminPaymentResponse>`.

`AdminPaymentResponse` includes `PaymentResponse` fields plus:

- `userId`: `String`, not nullable.
- `userEmail`: `String`, nullable.
- `userFullName`: `String`, nullable.

Example Request:

```http
GET /api/admin/payments?status=PENDING&page=0&size=20
Authorization: Bearer <admin-token>
```

Example Response:

```json
{
  "items": [
    {
      "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
      "membershipId": "6cfededa-3c84-4c46-8f86-7f0956c75a4b",
      "userId": "74a9f0d7-8f0d-402d-b69f-1d81bb9d51f4",
      "userEmail": "liming@example.com",
      "userFullName": "Li Ming",
      "paymentReference": "DIY-20260824-A8K2Q7",
      "amount": 360.00,
      "currency": "CNY",
      "paymentMethod": "WECHAT_MANUAL",
      "paymentRemark": "wechat: li-ming / account email liming@example.com",
      "status": "PENDING",
      "paidAt": null,
      "verifiedBy": null,
      "verifiedAt": null,
      "createdAt": "2026-08-24T09:48:00"
    }
  ],
  "page": 0,
  "size": 20,
  "totalItems": 1,
  "totalPages": 1
}
```

Success Status:
`200 OK`.

Possible Errors:

- `400 Bad Request`: invalid filter or pagination values.
- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: authenticated user is not an admin.

Business Rules:

- Admin only.
- Default sorting should prioritize pending payments, then newest `createdAt`.
- Payment search should support manual matching by reference, remark, user name, or email.
- Do not include sensitive user data beyond what is needed for payment verification.

### GET /api/admin/payments/{id}

Purpose:
Returns full payment details for admin verification.

Access:
Admin only.

Request DTO:
Path variable:

- `id`: `String`, required, payment UUID.

Response DTO:
`AdminPaymentResponse`.

Example Request:

```http
GET /api/admin/payments/15d3ec3f-7954-4c7a-92e9-d436d591356f
Authorization: Bearer <admin-token>
```

Example Response:

```json
{
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "membershipId": "6cfededa-3c84-4c46-8f86-7f0956c75a4b",
  "userId": "74a9f0d7-8f0d-402d-b69f-1d81bb9d51f4",
  "userEmail": "liming@example.com",
  "userFullName": "Li Ming",
  "paymentReference": "DIY-20260824-A8K2Q7",
  "amount": 360.00,
  "currency": "CNY",
  "paymentMethod": "WECHAT_MANUAL",
  "paymentRemark": "wechat: li-ming / account email liming@example.com",
  "status": "PENDING",
  "paidAt": null,
  "verifiedBy": null,
  "verifiedAt": null,
  "createdAt": "2026-08-24T09:48:00"
}
```

Success Status:
`200 OK`.

Possible Errors:

- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: authenticated user is not an admin.
- `404 Not Found`: payment does not exist.

Business Rules:

- Admin only.
- Response should include enough user/payment remark data to match WeChat receipts manually.
- Avoid exposing unrelated account details.

### PATCH /api/admin/payments/{id}/confirm

Purpose:
Confirms a pending manual payment and activates the associated membership.

Access:
Admin only.

Request DTO:
`ConfirmPaymentRequest`.

| Field | Java type | Required | Validation | Notes |
| --- | --- | --- | --- | --- |
| paidAt | LocalDateTime | No | none | Actual user payment time if known; defaults to current time or created time by policy |
| adminNote | String | No | `@Size(max = 500)` | Not currently represented in schema; omit unless admin notes are added later |

Response DTO:
`AdminPaymentResponse`.

Example Request:

```json
{
  "paidAt": "2026-08-24T09:45:00"
}
```

Example Response:

```json
{
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "membershipId": "6cfededa-3c84-4c46-8f86-7f0956c75a4b",
  "userId": "74a9f0d7-8f0d-402d-b69f-1d81bb9d51f4",
  "userEmail": "liming@example.com",
  "userFullName": "Li Ming",
  "paymentReference": "DIY-20260824-A8K2Q7",
  "amount": 360.00,
  "currency": "CNY",
  "paymentMethod": "WECHAT_MANUAL",
  "paymentRemark": "wechat: li-ming / account email liming@example.com",
  "status": "CONFIRMED",
  "paidAt": "2026-08-24T09:45:00",
  "verifiedBy": "2c3c380f-c575-4826-82a0-4f144574ef7d",
  "verifiedAt": "2026-08-24T10:00:00",
  "createdAt": "2026-08-24T09:48:00"
}
```

Success Status:
`200 OK`.

Possible Errors:

- `400 Bad Request`: invalid request body.
- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: authenticated user is not an admin.
- `404 Not Found`: payment does not exist.
- `409 Conflict`: payment is not `PENDING` or membership cannot be activated.

Business Rules:

- Admin only.
- Payment must exist.
- Payment must currently be `PENDING`.
- Record `verifiedBy` from admin auth context and `verifiedAt` as current time.
- Mark payment as `CONFIRMED`.
- Set `paidAt` from request when provided; otherwise use a documented backend default.
- Activate the associated membership.
- Set membership `startAt` to confirmation time or `paidAt` by policy.
- Set membership `expiresAt` based on `startAt + plan.durationMonths`.
- Payment confirmation and membership activation must happen in one transaction.
- If the user already has another active membership, V1 should reject or explicitly replace/extend; recommended V1 behavior is reject with `409 Conflict`.

### PATCH /api/admin/payments/{id}/reject

Purpose:
Rejects a pending manual payment request when the payment cannot be matched or is invalid.

Access:
Admin only.

Request DTO:
`RejectPaymentRequest`.

| Field | Java type | Required | Validation | Notes |
| --- | --- | --- | --- | --- |
| reason | String | Yes | `@NotBlank @Size(max = 500)` | Reason returned to user only if product wants to show it |

Response DTO:
`AdminPaymentResponse`.

Example Request:

```json
{
  "reason": "No matching WeChat transfer found for this reference."
}
```

Example Response:

```json
{
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "membershipId": "6cfededa-3c84-4c46-8f86-7f0956c75a4b",
  "userId": "74a9f0d7-8f0d-402d-b69f-1d81bb9d51f4",
  "userEmail": "liming@example.com",
  "userFullName": "Li Ming",
  "paymentReference": "DIY-20260824-A8K2Q7",
  "amount": 360.00,
  "currency": "CNY",
  "paymentMethod": "WECHAT_MANUAL",
  "paymentRemark": "wechat: li-ming / account email liming@example.com",
  "status": "REJECTED",
  "paidAt": null,
  "verifiedBy": "2c3c380f-c575-4826-82a0-4f144574ef7d",
  "verifiedAt": "2026-08-24T10:08:00",
  "createdAt": "2026-08-24T09:48:00"
}
```

Success Status:
`200 OK`.

Possible Errors:

- `400 Bad Request`: missing or invalid rejection reason.
- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: authenticated user is not an admin.
- `404 Not Found`: payment does not exist.
- `409 Conflict`: payment is not `PENDING`.

Business Rules:

- Admin only.
- Payment must currently be `PENDING`.
- Mark payment as `REJECTED`.
- Record `verifiedBy` and `verifiedAt`.
- Associated `PENDING` membership should become `CANCELLED`.
- Rejection must not affect an already active membership.
- Current schema has no payment rejection reason field; add one later or do not persist the reason in V1.

### POST /api/refunds

Purpose:
Creates a full refund request for an eligible confirmed payment.

Access:
Authenticated user.

Request DTO:
`CreateRefundRequest`.

| Field | Java type | Required | Validation | Notes |
| --- | --- | --- | --- | --- |
| paymentId | String | Yes | `@NotBlank` | Payment to refund |
| reason | String | No | `@Size(max = 500)` | User-provided reason |

Response DTO:
`RefundResponse`.

Example Request:

```json
{
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "reason": "I no longer need the DIY plan."
}
```

Example Response:

```json
{
  "refundId": "c3508d72-d111-489a-8400-ed19209a45bd",
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "amount": 360.00,
  "currency": "CNY",
  "reason": "I no longer need the DIY plan.",
  "status": "REQUESTED",
  "refundMethod": null,
  "externalRefundReference": null,
  "requestedAt": "2026-08-25T11:00:00",
  "processedAt": null,
  "processedBy": null,
  "payment": {
    "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
    "paymentReference": "DIY-20260824-A8K2Q7",
    "amount": 360.00,
    "currency": "CNY",
    "paymentMethod": "WECHAT_MANUAL",
    "status": "CONFIRMED",
    "createdAt": "2026-08-24T09:48:00"
  }
}
```

Success Status:
`201 Created`.

Possible Errors:

- `400 Bad Request`: invalid DTO.
- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: payment belongs to another user.
- `404 Not Found`: payment does not exist.
- `409 Conflict`: payment is not confirmed, refund window has expired, or a refund already exists.

Business Rules:

- Authenticated user only.
- Payment must belong to the authenticated user.
- Payment must be `CONFIRMED`.
- Refund request must be within `payment.paidAt + plan.refundWindowDays`.
- If `paidAt` is null on a confirmed payment, use `verifiedAt` only as a fallback by documented policy.
- V1 supports full refunds only, so backend sets refund amount equal to payment amount.
- Backend sets currency from payment.
- Duplicate refund request must not be allowed; schema enforces one refund per payment.
- Creating a refund request does not immediately mark payment `REFUNDED`; that happens when refund is completed.

### GET /api/refunds/{id}

Purpose:
Returns refund details for the authenticated user's refund request.

Access:
Authenticated user.

Request DTO:
Path variable:

- `id`: `String`, required, refund UUID.

Response DTO:
`RefundResponse`.

Example Request:

```http
GET /api/refunds/c3508d72-d111-489a-8400-ed19209a45bd
Authorization: Bearer <token>
```

Example Response:

```json
{
  "refundId": "c3508d72-d111-489a-8400-ed19209a45bd",
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "amount": 360.00,
  "currency": "CNY",
  "reason": "I no longer need the DIY plan.",
  "status": "REQUESTED",
  "refundMethod": null,
  "externalRefundReference": null,
  "requestedAt": "2026-08-25T11:00:00",
  "processedAt": null,
  "processedBy": null,
  "payment": {
    "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
    "paymentReference": "DIY-20260824-A8K2Q7",
    "amount": 360.00,
    "currency": "CNY",
    "paymentMethod": "WECHAT_MANUAL",
    "status": "CONFIRMED",
    "createdAt": "2026-08-24T09:48:00"
  }
}
```

Success Status:
`200 OK`.

Possible Errors:

- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: refund exists but belongs to another user's payment.
- `404 Not Found`: refund does not exist.

Business Rules:

- Normal users can only access refunds tied to their own payments.
- Admin identity in `processedBy` may be omitted or null in user-facing response if needed.

### GET /api/admin/refunds

Purpose:
Lists refund requests for admin review and processing.

Access:
Admin only.

Request DTO:
`AdminRefundSearchRequest` as query parameters.

| Field | Java type | Required | Validation | Notes |
| --- | --- | --- | --- | --- |
| status | RefundStatus | No | enum | Filter by status |
| paymentId | String | No | UUID format if validated | Filter by payment |
| userId | String | No | UUID format if validated | Filter by payment user |
| requestedFrom | LocalDateTime | No | none | Inclusive |
| requestedTo | LocalDateTime | No | none | Inclusive |
| page | Integer | No | `@Min(0)` | Default `0` |
| size | Integer | No | `@Min(1) @Max(100)` | Default `20` |

Response DTO:
`AdminRefundPageResponse` extends `PageResponse<AdminRefundResponse>`.

`AdminRefundResponse` includes `RefundResponse` fields plus:

- `userId`: `String`, not nullable.
- `userEmail`: `String`, nullable.
- `userFullName`: `String`, nullable.

Example Request:

```http
GET /api/admin/refunds?status=REQUESTED&page=0&size=20
Authorization: Bearer <admin-token>
```

Example Response:

```json
{
  "items": [
    {
      "refundId": "c3508d72-d111-489a-8400-ed19209a45bd",
      "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
      "userId": "74a9f0d7-8f0d-402d-b69f-1d81bb9d51f4",
      "userEmail": "liming@example.com",
      "userFullName": "Li Ming",
      "amount": 360.00,
      "currency": "CNY",
      "reason": "I no longer need the DIY plan.",
      "status": "REQUESTED",
      "refundMethod": null,
      "externalRefundReference": null,
      "requestedAt": "2026-08-25T11:00:00",
      "processedAt": null,
      "processedBy": null
    }
  ],
  "page": 0,
  "size": 20,
  "totalItems": 1,
  "totalPages": 1
}
```

Success Status:
`200 OK`.

Possible Errors:

- `400 Bad Request`: invalid filter or pagination values.
- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: authenticated user is not an admin.

Business Rules:

- Admin only.
- Default sorting should prioritize `REQUESTED`, then oldest `requestedAt` first.
- Admin needs enough payment/user details to perform manual refund processing.

### PATCH /api/admin/refunds/{id}/approve

Purpose:
Approves an eligible refund request before manual refund processing.

Access:
Admin only.

Request DTO:
`ApproveRefundRequest`.

| Field | Java type | Required | Validation | Notes |
| --- | --- | --- | --- | --- |
| note | String | No | `@Size(max = 500)` | Not currently represented in schema; omit unless notes are added later |

Response DTO:
`AdminRefundResponse`.

Example Request:

```json
{}
```

Example Response:

```json
{
  "refundId": "c3508d72-d111-489a-8400-ed19209a45bd",
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "userId": "74a9f0d7-8f0d-402d-b69f-1d81bb9d51f4",
  "userEmail": "liming@example.com",
  "userFullName": "Li Ming",
  "amount": 360.00,
  "currency": "CNY",
  "reason": "I no longer need the DIY plan.",
  "status": "APPROVED",
  "refundMethod": null,
  "externalRefundReference": null,
  "requestedAt": "2026-08-25T11:00:00",
  "processedAt": null,
  "processedBy": "2c3c380f-c575-4826-82a0-4f144574ef7d"
}
```

Success Status:
`200 OK`.

Possible Errors:

- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: authenticated user is not an admin.
- `404 Not Found`: refund does not exist.
- `409 Conflict`: refund is not `REQUESTED` or refund is no longer eligible.

Business Rules:

- Admin only.
- Refund must currently be `REQUESTED`.
- Re-check eligibility at approval time.
- Mark refund `APPROVED`.
- Record `processedBy` from admin auth context.
- Do not mark payment `REFUNDED` yet; money has not been returned.

### PATCH /api/admin/refunds/{id}/reject

Purpose:
Rejects a refund request.

Access:
Admin only.

Request DTO:
`RejectRefundRequest`.

| Field | Java type | Required | Validation | Notes |
| --- | --- | --- | --- | --- |
| reason | String | Yes | `@NotBlank @Size(max = 500)` | Rejection reason |

Response DTO:
`AdminRefundResponse`.

Example Request:

```json
{
  "reason": "Refund window expired before the request was submitted."
}
```

Example Response:

```json
{
  "refundId": "c3508d72-d111-489a-8400-ed19209a45bd",
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "userId": "74a9f0d7-8f0d-402d-b69f-1d81bb9d51f4",
  "userEmail": "liming@example.com",
  "userFullName": "Li Ming",
  "amount": 360.00,
  "currency": "CNY",
  "reason": "I no longer need the DIY plan.",
  "status": "REJECTED",
  "refundMethod": null,
  "externalRefundReference": null,
  "requestedAt": "2026-08-25T11:00:00",
  "processedAt": "2026-08-25T12:20:00",
  "processedBy": "2c3c380f-c575-4826-82a0-4f144574ef7d"
}
```

Success Status:
`200 OK`.

Possible Errors:

- `400 Bad Request`: missing or invalid rejection reason.
- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: authenticated user is not an admin.
- `404 Not Found`: refund does not exist.
- `409 Conflict`: refund is already completed, failed, or rejected.

Business Rules:

- Admin only.
- Refund can be rejected from `REQUESTED` or `APPROVED`.
- Record `processedBy` and `processedAt`.
- Do not change payment status or membership status when rejecting a refund.
- Current schema has no dedicated refund rejection reason field; use existing `reason` carefully or add `admin_reason` later.

### PATCH /api/admin/refunds/{id}/complete

Purpose:
Marks an approved manual refund as completed after money has been returned.

Access:
Admin only.

Request DTO:
`CompleteRefundRequest`.

| Field | Java type | Required | Validation | Notes |
| --- | --- | --- | --- | --- |
| refundMethod | RefundMethod | Yes | `@NotNull` | V1: `WECHAT_MANUAL` |
| externalRefundReference | String | No | `@Size(max = 255)` | Manual refund transaction/reference |

Response DTO:
`AdminRefundResponse`.

Example Request:

```json
{
  "refundMethod": "WECHAT_MANUAL",
  "externalRefundReference": "WX-REFUND-20260825-001"
}
```

Example Response:

```json
{
  "refundId": "c3508d72-d111-489a-8400-ed19209a45bd",
  "paymentId": "15d3ec3f-7954-4c7a-92e9-d436d591356f",
  "userId": "74a9f0d7-8f0d-402d-b69f-1d81bb9d51f4",
  "userEmail": "liming@example.com",
  "userFullName": "Li Ming",
  "amount": 360.00,
  "currency": "CNY",
  "reason": "I no longer need the DIY plan.",
  "status": "COMPLETED",
  "refundMethod": "WECHAT_MANUAL",
  "externalRefundReference": "WX-REFUND-20260825-001",
  "requestedAt": "2026-08-25T11:00:00",
  "processedAt": "2026-08-25T13:05:00",
  "processedBy": "2c3c380f-c575-4826-82a0-4f144574ef7d"
}
```

Success Status:
`200 OK`.

Possible Errors:

- `400 Bad Request`: invalid DTO.
- `401 Unauthorized`: missing or invalid authentication.
- `403 Forbidden`: authenticated user is not an admin.
- `404 Not Found`: refund does not exist.
- `409 Conflict`: refund is not `APPROVED` or `PROCESSING`.

Business Rules:

- Admin only.
- Refund must be `APPROVED` or `PROCESSING`.
- Set refund `status` to `COMPLETED`.
- Set `refundMethod`, `externalRefundReference`, `processedBy`, and `processedAt`.
- Mark payment as `REFUNDED`.
- Cancel the associated active membership because V1 refunds are full refunds.
- Refund completion, payment status update, and membership cancellation must happen in one transaction.

## Recommended DTO Class Names

Requests:

- `CreatePaymentRequest`
- `AdminPaymentSearchRequest`
- `ConfirmPaymentRequest`
- `RejectPaymentRequest`
- `CreateRefundRequest`
- `AdminRefundSearchRequest`
- `ApproveRefundRequest`
- `RejectRefundRequest`
- `CompleteRefundRequest`

Responses:

- `MembershipPlanResponse`
- `MembershipPlansResponse`
- `MembershipResponse`
- `PaymentSummaryResponse`
- `PaymentResponse`
- `AdminPaymentResponse`
- `AdminPaymentPageResponse`
- `RefundSummaryResponse`
- `RefundResponse`
- `AdminRefundResponse`
- `AdminRefundPageResponse`
- `PageResponse<T>`

## Recommended Enums

### PaymentMethod

- `WECHAT_MANUAL`

Future values may include `ALIPAY_MANUAL`, `WECHAT_PAY`, `CARD`, or `BANK_TRANSFER`.

### PaymentStatus

- `PENDING`
- `CONFIRMED`
- `REJECTED`
- `REFUNDED`

Optional future values:

- `EXPIRED`
- `CANCELLED`

### MembershipStatus

- `NONE`
- `PENDING`
- `ACTIVE`
- `EXPIRED`
- `CANCELLED`

`NONE` is recommended for API response only, not necessarily database storage.

### RefundMethod

- `WECHAT_MANUAL`

Future values may include `ORIGINAL_PAYMENT_METHOD`, `BANK_TRANSFER`, or `ALIPAY_MANUAL`.

### RefundStatus

- `REQUESTED`
- `APPROVED`
- `REJECTED`
- `PROCESSING`
- `COMPLETED`
- `FAILED`

## State Transitions

### Payment

Allowed:

- `PENDING -> CONFIRMED`
- `PENDING -> REJECTED`
- `CONFIRMED -> REFUNDED`

Not allowed:

- `REJECTED -> CONFIRMED`; create a new payment request instead.
- `REFUNDED -> CONFIRMED`; refund is final.
- `PENDING -> REFUNDED`; payment was never confirmed.
- `CONFIRMED -> REJECTED`; use refund flow if money must be returned.

### Membership

Allowed:

- `PENDING -> ACTIVE`
- `PENDING -> CANCELLED`
- `ACTIVE -> EXPIRED`
- `ACTIVE -> CANCELLED`

Not allowed:

- `CANCELLED -> ACTIVE`; create a new membership/payment.
- `EXPIRED -> ACTIVE` without a new confirmed payment or explicit renewal operation.
- `PENDING -> EXPIRED`; pending memberships should be cancelled or remain pending until payment request expiry exists.

### Refund

Allowed:

- `REQUESTED -> APPROVED`
- `REQUESTED -> REJECTED`
- `APPROVED -> PROCESSING`
- `APPROVED -> COMPLETED`
- `PROCESSING -> COMPLETED`
- `PROCESSING -> FAILED`
- `FAILED -> PROCESSING`

Not allowed:

- `COMPLETED -> REJECTED`
- `REJECTED -> APPROVED`
- `REQUESTED -> COMPLETED` unless V1 intentionally skips the approval step; recommended behavior is to approve first.
- `COMPLETED -> FAILED`

## API Design Problems and Inconsistencies

- `GET /api/payments/current` is ambiguous. Define it as pending payment first, latest payment second, or replace it with `GET /api/payments?status=PENDING`.
- There is no user-facing payment list endpoint. Consider `GET /api/payments` for payment history.
- There is no endpoint to update a pending payment remark. Consider `PATCH /api/payments/{id}` with only `paymentRemark` if users may correct WeChat identifying information.
- Admin reject endpoints accept reasons, but the current payment schema has no rejection reason field and refund schema has only the user's `reason`. Consider adding admin note/reason fields before implementation.
- Refund lifecycle includes `PROCESSING` and `FAILED`, but there is no proposed endpoint to mark a refund as processing or failed. Either add endpoints or simplify V1 statuses.
- `PATCH /api/admin/refunds/{id}/complete` can technically move `APPROVED -> COMPLETED` directly, making `PROCESSING` optional. That is acceptable for V1 manual flow if documented.
- Automatic renewal is represented by `auto_renew`, but V1 manual WeChat payments do not actually support recurring billing. Treat it as a preference only.
- `GET /api/admin/refunds/{id}` is missing but useful for admin detail views. It should be added for consistency with admin payments.

## Recommended Endpoint Changes

Add:

- `GET /api/payments`: authenticated user's payment history.
- `PATCH /api/payments/{id}`: allow user to edit `paymentRemark` while payment is `PENDING`.
- `GET /api/admin/refunds/{id}`: admin refund detail view.

Consider adding later:

- `PATCH /api/admin/refunds/{id}/processing`: mark an approved refund as being processed.
- `PATCH /api/admin/refunds/{id}/fail`: record a failed manual refund attempt.
- `POST /api/payments/{id}/cancel`: allow a user to cancel a stale pending payment request.

Do not remove yet:

- Keep all proposed endpoints for V1, but document the ambiguous `current` behavior.

## V1 Manual WeChat Implementation Order

1. `GET /api/membership/plans`
2. `POST /api/payments`
3. `GET /api/payments/current`
4. `GET /api/admin/payments`
5. `GET /api/admin/payments/{id}`
6. `PATCH /api/admin/payments/{id}/confirm`
7. `PATCH /api/admin/payments/{id}/reject`
8. `GET /api/membership/current`
9. `POST /api/refunds`
10. `GET /api/refunds/{id}`
11. `GET /api/admin/refunds`
12. `PATCH /api/admin/refunds/{id}/approve`
13. `PATCH /api/admin/refunds/{id}/reject`
14. `PATCH /api/admin/refunds/{id}/complete`

