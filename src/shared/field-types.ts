export type FieldType = 'string' | 'timestamp' | 'double' | 'integer' | 'boolean';

export const FIELD_TYPES = new Map<string, FieldType>([
  ['transaction_id', 'string'],
  ['timestamp', 'timestamp'],
  ['sender_account', 'string'],
  ['receiver_account', 'string'],
  ['amount', 'double'],
  ['transaction_type', 'string'],
  ['merchant_category', 'string'],
  ['location', 'string'],
  ['device_used', 'string'],
  ['time_since_last_transaction', 'double'],
  ['spending_deviation_score', 'double'],
  ['velocity_score', 'integer'],
  ['geo_anomaly_score', 'double'],
  ['payment_channel', 'string'],
  ['ip_address', 'string'],
  ['device_hash', 'string'],
]);
