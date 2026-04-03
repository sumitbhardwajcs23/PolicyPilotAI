import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { User } from '../src/models/User';

// Fix for Node.js 18+ DNS resolution issues on some Windows systems
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

dotenv.config({ path: path.join(__dirname, '../.env') });

const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.error('❌ Please provide an email: npx ts-node scripts/promote-admin.ts user@example.com');
  process.exit(1);
}

async function promote() {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) throw new Error('DATABASE_URL not found in .env');

    console.log(`Connecting to database...`);
    await mongoose.connect(dbUrl);

    const user = await User.findOne({ email: emailToPromote.toLowerCase() });

    if (!user) {
      console.error(`❌ User with email ${emailToPromote} not found.`);
      process.exit(1);
    }

    user.role = 'admin';
    user.adminType = 'master';
    user.kycStatus = 'verified';
    user.isActive = true;
    
    // Ensure permissions are empty as master bypasses them anyway, 
    // or give them all if you prefer.
    user.permissions = []; 

    await user.save();

    console.log(`✅ Successfully promoted ${emailToPromote} to Master Admin!`);
    console.log(`   Role: ${user.role}`);
    console.log(`   AdminType: ${user.adminType}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Promotion failed:', error);
    process.exit(1);
  }
}

promote();
