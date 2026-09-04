import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function main() {
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(`
      id,
      booking_date,
      payment_status,
      services (
        id,
        name,
        price
      )
    `);
  
  if (error) {
    console.error("Error fetching bookings:", error);
    return;
  }
  
  console.log("Bookings:");
  console.dir(bookings, { depth: null });
}

main();
