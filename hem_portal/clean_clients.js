const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function cleanDuplicates() {
  console.log('Fetching all clients...');
  
  const { data: clients, error } = await supabaseAdmin.from('clients').select('id, name');
  if (error) {
    console.error('Error fetching clients:', error.message);
    return;
  }

  const seen = new Set();
  const duplicateIds = [];

  for (const client of clients) {
    if (seen.has(client.name)) {
      duplicateIds.push(client.id);
    } else {
      seen.add(client.name);
    }
  }

  console.log(`Found ${duplicateIds.length} duplicate clients.`);

  if (duplicateIds.length > 0) {
    console.log('Deleting duplicates...');
    const { error: deleteError } = await supabaseAdmin
      .from('clients')
      .delete()
      .in('id', duplicateIds);
      
    if (deleteError) {
      console.error('Error deleting duplicates:', deleteError.message);
    } else {
      console.log('Successfully deleted all duplicate clients!');
    }
  }
}

cleanDuplicates();
