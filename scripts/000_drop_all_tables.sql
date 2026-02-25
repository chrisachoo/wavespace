-- Drop all Wavespace tables and RPCs. Run this before 001_create_schema.sql for a fresh DB.
-- Run in Supabase SQL Editor (or psql). Order: drop functions, then tables (answers → questions, participants → quizzes).

-- RPCs (reference tables by name)
drop function if exists public.join_quiz(uuid, text);
drop function if exists public.submit_answer(uuid, uuid, uuid, int);

-- Tables (reverse dependency order: answers → questions & participants → quizzes)
drop table if exists public.answers;
drop table if exists public.questions;
drop table if exists public.participants;
drop table if exists public.quizzes;
