-- Migration 003: Add salary and custom_fields columns to employees
-- Run this in Supabase SQL Editor

ALTER TABLE employees ADD COLUMN IF NOT EXISTS salary integer;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS custom_fields text;
