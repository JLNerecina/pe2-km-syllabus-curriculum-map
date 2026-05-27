-- PE2 Curriculum Map Demo Reset Script
-- Run this in the Supabase SQL Editor to configure the backup schema and the reset utility function.

-- 1. Create a dedicated backup schema
CREATE SCHEMA IF NOT EXISTS backup;

-- 2. Clean existing backup tables (so this script is safe to rerun)
DROP TABLE IF EXISTS backup.audit_logs CASCADE;
DROP TABLE IF EXISTS backup.faculty_overseen_programs CASCADE;
DROP TABLE IF EXISTS backup.student_courses CASCADE;
DROP TABLE IF EXISTS backup.student_terms CASCADE;
DROP TABLE IF EXISTS backup.course_prerequisites CASCADE;
DROP TABLE IF EXISTS backup.courses CASCADE;
DROP TABLE IF EXISTS backup.profiles CASCADE;
DROP TABLE IF EXISTS backup.programs CASCADE;
DROP TABLE IF EXISTS backup.departments CASCADE;
DROP TABLE IF EXISTS backup.preauthorized_users CASCADE;

-- 3. Clone the pristine public tables to the backup schema
CREATE TABLE backup.departments AS SELECT * FROM public.departments;
CREATE TABLE backup.programs AS SELECT * FROM public.programs;
CREATE TABLE backup.profiles AS SELECT * FROM public.profiles;
CREATE TABLE backup.courses AS SELECT * FROM public.courses;
CREATE TABLE backup.course_prerequisites AS SELECT * FROM public.course_prerequisites;
CREATE TABLE backup.student_terms AS SELECT * FROM public.student_terms;
CREATE TABLE backup.student_courses AS SELECT * FROM public.student_courses;
CREATE TABLE backup.preauthorized_users AS SELECT * FROM public.preauthorized_users;
CREATE TABLE backup.faculty_overseen_programs AS SELECT * FROM public.faculty_overseen_programs;
CREATE TABLE backup.audit_logs AS SELECT * FROM public.audit_logs;

-- 4. Create the robust reset utility function
CREATE OR REPLACE FUNCTION public.reset_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- Secure the function path (fixes search path hijacking vulnerability)
AS $$
BEGIN
    -- Disable triggers and foreign keys temporarily to prevent cascading conflicts
    SET session_replication_role = 'replica';

    -- Clear public tables
    TRUNCATE TABLE public.audit_logs CASCADE;
    TRUNCATE TABLE public.faculty_overseen_programs CASCADE;
    TRUNCATE TABLE public.student_courses CASCADE;
    TRUNCATE TABLE public.student_terms CASCADE;
    TRUNCATE TABLE public.course_prerequisites CASCADE;
    TRUNCATE TABLE public.courses CASCADE;
    TRUNCATE TABLE public.profiles CASCADE;
    TRUNCATE TABLE public.programs CASCADE;
    TRUNCATE TABLE public.departments CASCADE;
    TRUNCATE TABLE public.preauthorized_users CASCADE;

    -- Restore data from backup schema
    INSERT INTO public.departments SELECT * FROM backup.departments;
    INSERT INTO public.programs SELECT * FROM backup.programs;
    INSERT INTO public.profiles SELECT * FROM backup.profiles;
    INSERT INTO public.courses SELECT * FROM backup.courses;
    INSERT INTO public.course_prerequisites SELECT * FROM backup.course_prerequisites;
    INSERT INTO public.student_terms SELECT * FROM backup.student_terms;
    INSERT INTO public.student_courses SELECT * FROM backup.student_courses;
    INSERT INTO public.preauthorized_users SELECT * FROM backup.preauthorized_users;
    INSERT INTO public.faculty_overseen_programs SELECT * FROM backup.faculty_overseen_programs;
    INSERT INTO public.audit_logs SELECT * FROM backup.audit_logs;

    -- Re-enable triggers and constraints
    SET session_replication_role = 'origin';

    RAISE NOTICE 'PE2 demo data restored from backup schema.';
END;
$$;

-- 5. Revoke public/unauthenticated direct RPC execution of the reset function
REVOKE EXECUTE ON FUNCTION public.reset_demo_data() FROM PUBLIC, anon, authenticated;

-- 6. Enable pg_cron extension and schedule automated reset (Runs every 6 hours)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'pe2-demo-reset',            -- Unique job name
    '0 */6 * * *',               -- Cron syntax (Every 6 hours)
    'SELECT public.reset_demo_data();' -- SQL command to execute
);

