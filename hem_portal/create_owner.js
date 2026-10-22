const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createOwner() {
  console.log('Creating owner account: sanjay@gmail.com...');
  
  // 1. Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: 'sanjay@gmail.com',
    password: 'qwerty696',
    email_confirm: true
  });

  if (authError) {
    console.error('Failed to create auth user:', authError.message);
    return;
  }

  const userId = authData.user.id;
  console.log('Auth user created with ID:', userId);

  // 2. Insert into public.users with owner role
  const { error: dbError } = await supabaseAdmin.from('users').upsert({
    id: userId,
    email: 'sanjay@gmail.com',
    full_name: 'Sanjay (Owner)',
    role: 'owner',
    level: 'L5',
    state: 'ALL'
  });

  if (dbError) {
    console.error('Failed to insert into public.users:', dbError.message);
    return;
  }

  console.log('Successfully created owner account and assigned L5 Owner role!');
}

createOwner();
