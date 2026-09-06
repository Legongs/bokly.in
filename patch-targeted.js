const fs = require('fs');
let content = fs.readFileSync('types/database.types.ts', 'utf8');

// Replace updated_at in tenants (Row, Insert, Update)
content = content.replace(/theme_color: string \| null/g, 'theme_color: string | null\n          updated_at: string');
content = content.replace(/theme_color\?: string \| null/g, 'theme_color?: string | null\n          updated_at?: string');

// Replace reminder flags in bookings (Row, Insert, Update)
content = content.replace(/is_reminder_sent: boolean/g, 'is_reminder_sent: boolean\n          reminder_h1_sent: boolean\n          reminder_h2_sent: boolean\n          reminder_h3_sent: boolean');
content = content.replace(/is_reminder_sent\?: boolean/g, 'is_reminder_sent?: boolean\n          reminder_h1_sent?: boolean\n          reminder_h2_sent?: boolean\n          reminder_h3_sent?: boolean');

// Add voucher_id to billing_intents
content = content.replace(/midtrans_token\?: string \| null;\r?\n          created_at\?: string;/g, 'midtrans_token?: string | null;\n          voucher_id?: string | null;\n          created_at?: string;');
content = content.replace(/midtrans_token: string \| null;\r?\n          created_at: string;/g, 'midtrans_token: string | null;\n          voucher_id: string | null;\n          created_at: string;');

fs.writeFileSync('types/database.types.ts', content);
