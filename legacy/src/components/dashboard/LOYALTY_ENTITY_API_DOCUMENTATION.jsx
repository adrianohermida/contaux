# 📚 LOYALTY PROGRAM ENTITIES - API DOCUMENTATION

**Last Updated:** 03/03/2026  
**Sprint:** 20 - LoyaltyProgram & Customer Rewards  
**Status:** ✅ Complete - Production Ready  
**Version:** 1.0.0

---

## 📋 TABLE OF CONTENTS

1. [Entity Overview](#entity-overview)
2. [Schema Definitions](#schema-definitions)
3. [API Endpoints](#api-endpoints)
4. [CRUD Operations](#crud-operations)
5. [Tier System](#tier-system)
6. [Points Transactions](#points-transactions)
7. [Reward Redemption](#reward-redemption)
8. [Integration Points](#integration-points)
9. [Error Handling](#error-handling)

---

## 🎯 ENTITY OVERVIEW

### Purpose
The Loyalty Program system manages customer rewards, tier progression, and redemption workflows. Integrates with Campaign, Sales, and Payment modules.

### Key Features
- ✅ Multi-tier program support (Bronze, Silver, Gold, Platinum, etc.)
- ✅ Dynamic point calculation with tier bonuses
- ✅ Reward redemption with expiration
- ✅ Real-time tier progression tracking
- ✅ Points audit trail / transaction history
- ✅ Campaign integration (earn points from conversions)
- ✅ Sales integration (points from closed deals)
- ✅ Payment integration (points per dollar spent)
- ✅ Full CRUD operations
- ✅ Multi-tenancy support

---

## 📐 SCHEMA DEFINITIONS

### LoyaltyProgram Entity

```json
{
  "name": "LoyaltyProgram",
  "type": "object",
  "properties": {
    "workspace_id": "string (REQUIRED)",
    "name": "string (REQUIRED)",
    "description": "string",
    "status": "enum: active|inactive|archived (default: active)",
    "points_per_dollar": "number (default: 1)",
    "redemption_rate": "number (default: 1)",
    "tier_system": "boolean (default: false)",
    "tiers": "array of tier objects",
    "member_count": "number (default: 0)",
    "total_points_issued": "number (default: 0)",
    "total_points_redeemed": "number (default: 0)",
    "launch_date": "date"
  }
}
```

### Tier Object Structure
```json
{
  "name": "string (e.g., Gold)",
  "min_points": "number (threshold)",
  "max_points": "number (optional upper bound)",
  "benefits": "array of strings",
  "bonus_multiplier": "number (default: 1)"
}
```

### CustomerPoints Entity

```json
{
  "name": "CustomerPoints",
  "type": "object",
  "properties": {
    "workspace_id": "string (REQUIRED)",
    "contact_id": "string (REQUIRED - FK Client)",
    "loyalty_program_id": "string (REQUIRED - FK LoyaltyProgram)",
    "current_points": "number (default: 0)",
    "lifetime_points": "number (default: 0)",
    "points_redeemed": "number (default: 0)",
    "tier": "string",
    "member_since": "date",
    "last_activity_date": "date",
    "is_active": "boolean (default: true)"
  }
}
```

### RewardRedemption Entity

```json
{
  "name": "RewardRedemption",
  "type": "object",
  "properties": {
    "workspace_id": "string (REQUIRED)",
    "contact_id": "string (REQUIRED - FK Client)",
    "loyalty_program_id": "string (REQUIRED - FK LoyaltyProgram)",
    "points_redeemed": "number (REQUIRED)",
    "reward_value": "number",
    "reward_type": "enum: discount|credit|gift|free_product",
    "status": "enum: pending|approved|used|expired (default: pending)",
    "expiration_date": "date",
    "code": "string (unique redemption code)",
    "notes": "string"
  }
}
```

---

## 🔌 API ENDPOINTS

### Base URLs
```
LoyaltyProgram:    /entities/LoyaltyProgram
CustomerPoints:    /entities/CustomerPoints
RewardRedemption:  /entities/RewardRedemption
```

### Operations
- `POST /create` - Create new entity
- `GET /filter` - Filter/list entities
- `PUT /update/:id` - Update entity
- `DELETE /delete/:id` - Delete entity

---

## 📝 CRUD OPERATIONS

### CREATE - LoyaltyProgram

```typescript
const program = await base44.entities.LoyaltyProgram.create({
  workspace_id: "ws_1",
  name: "Gold Rewards",
  description: "Premium loyalty program",
  points_per_dollar: 2,
  redemption_rate: 1,
  tier_system: true,
  tiers: [
    {
      name: "Bronze",
      min_points: 0,
      benefits: ["5% discount"],
      bonus_multiplier: 1
    },
    {
      name: "Gold",
      min_points: 5000,
      benefits: ["15% discount", "free shipping", "priority support"],
      bonus_multiplier: 1.2
    }
  ],
  launch_date: "2026-03-02"
});

// Returns: program with id, created_date, status: "active"
```

### CREATE - Customer Enrollment

```typescript
const enrollment = await base44.entities.CustomerPoints.create({
  workspace_id: "ws_1",
  contact_id: "client_1",
  loyalty_program_id: "prog_1"
});

// Returns: CustomerPoints with current_points: 0, member_since: today
```

### READ - List Programs

```typescript
// Get all active programs
const programs = await base44.entities.LoyaltyProgram.filter({
  workspace_id: "ws_1",
  status: "active"
}, "-launch_date", 100);

// Get specific customer points
const points = await base44.entities.CustomerPoints.filter({
  contact_id: "client_1",
  workspace_id: "ws_1"
});
```

### UPDATE - Award Points

```typescript
const updated = await base44.entities.CustomerPoints.update("cp_1", {
  current_points: 250,
  lifetime_points: 500,
  last_activity_date: new Date().toISOString().split('T')[0]
});
```

### UPDATE - Redeem Reward

```typescript
const redeemed = await base44.entities.RewardRedemption.update("reward_1", {
  status: "used"
});
```

---

## 🏆 TIER SYSTEM

### Tier Progression Logic

```typescript
// Calculate tier based on lifetime_points
const tierMapping = {
  "Bronze": { min: 0, benefits: ["5% discount"] },
  "Silver": { min: 1000, benefits: ["10% discount", "free shipping"] },
  "Gold": { min: 5000, benefits: ["15% discount", "priority support"] },
  "Platinum": { min: 10000, benefits: ["20% discount", "VIP access"] }
};

// Function: calculateLoyaltyTier
// INPUT: { customer_id, lifetime_points }
// OUTPUT: { tier, benefits, bonus_multiplier, progress_to_next }
```

### Tier Benefits Application

```typescript
// Bonus multiplier example:
if (tier === "Gold") {
  const multiplier = 1.2; // 20% bonus
  const earnedPoints = 100;
  const bonusPoints = Math.floor(earnedPoints * (multiplier - 1));
  const totalPoints = earnedPoints + bonusPoints; // 120
}
```

---

## 💰 POINTS TRANSACTIONS

### Function: executePointsTransaction

```typescript
// Award points
const result = await base44.functions.invoke('executePointsTransaction', {
  customer_id: "cp_1",
  loyalty_program_id: "prog_1",
  points_change: 100,    // Positive = earn, negative = redeem
  source: "purchase",    // purchase|referral|tier_bonus|manual
  reference_id: "order_1"
});

// Returns:
{
  success: true,
  new_balance: 250,
  tier_bonus: 10,
  actual_points_change: 110,
  transaction_id: "TXN_..."
}
```

### Validation Rules

```typescript
// Redemption validation
if (points_change < 0) {
  const newBalance = current_points + points_change;
  if (newBalance < 0) {
    throw Error('Insufficient balance');
  }
}

// Balance cannot be negative
if (new_balance < 0) {
  throw Error('Invalid transaction');
}
```

---

## 🎁 REWARD REDEMPTION

### Redemption Workflow

```
1. Customer has 500 points
2. Creates RewardRedemption with status: "pending"
3. Admin approves → status: "approved"
4. Customer uses → status: "used"
5. Expires if date passed → status: "expired"
```

### Create Reward

```typescript
const reward = await base44.entities.RewardRedemption.create({
  workspace_id: "ws_1",
  contact_id: "client_1",
  loyalty_program_id: "prog_1",
  points_redeemed: 100,
  reward_type: "discount",
  expiration_date: "2026-06-02"
});

// Returns: reward with code: "REWARD_ABC123", status: "pending"
```

### Approve & Use Reward

```typescript
// Approve
await base44.entities.RewardRedemption.update("reward_1", {
  status: "approved"
});

// Use
await base44.entities.RewardRedemption.update("reward_1", {
  status: "used"
});
```

---

## 🔗 INTEGRATION POINTS

### With Campaign (Sprint 19)
```typescript
// Award points when campaign converts
const campaign = { id: "camp_1", contact_id: "client_1" };
await executePointsTransaction({
  customer_id: "cp_1",
  points_change: 200,
  source: "campaign_conversion",
  reference_id: campaign.id
});
```

### With Sales (Sprint 18)
```typescript
// Award points on won opportunity
const opportunity = { id: "opp_1", deal_value: 5000 };
const pointsToAward = opportunity.deal_value / 100; // $50 = 50 points
```

### With Payment (Sprint 16)
```typescript
// Award points per transaction
const payment = { amount: 100, program: { points_per_dollar: 1 } };
const points = payment.amount * payment.program.points_per_dollar;
```

---

## ⚠️ ERROR HANDLING

### Common Errors

```typescript
// Insufficient balance
{ error: "Insufficient points balance", status: 400 }

// Customer not in program
{ error: "Customer points record not found", status: 404 }

// Program not found
{ error: "Loyalty program not found", status: 404 }

// Invalid status transition
{ error: "Cannot transition to invalid status", status: 400 }

// Multi-tenancy violation
{ error: "Unauthorized: tenant mismatch", status: 403 }
```

---

## 🏆 BEST PRACTICES

1. **Always validate balance** before redeeming points
2. **Apply tier bonuses automatically** on point earn
3. **Track audit trail** of all transactions
4. **Set expiration dates** on rewards
5. **Sync with Campaign/Sales** for integrated points
6. **Use unique codes** for rewards
7. **Regular cleanup** of expired rewards
8. **Monitor redemption rates** for ROI

---

**API Documentation Version:** 1.0.0  
**Last Updated:** 03/03/2026  
**Status:** ✅ Production Ready