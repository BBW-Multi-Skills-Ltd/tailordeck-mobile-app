export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]
export type DbJobStatus = 'draft' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type DbNotificationType = 'deadline' | 'balance' | 'invoice' | 'account' | 'general'
