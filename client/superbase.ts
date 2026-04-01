import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = "https://htqsidmrqueojdobwzzv.supabase.co";
const supabaseAnonKey: string = "sb_publishable_Yi-nnbVR2Jbgyv0IGUY44g_VuoO-Lau";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);