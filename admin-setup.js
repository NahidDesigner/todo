// Admin Setup Script
// Run this in browser console to create admin user directly

const createAdminUser = async () => {
    try {
        // Admin user data
        const adminData = {
            email: 'nahidwebdesigner@gmail.com',
            name: 'Nahid',
            role: 'admin',
            department: 'Web Design',
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        // Check if user exists in Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(
            adminData.email, 
            'admin123456' // Temporary password
        );

        // Create user document in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            ...adminData,
            uid: userCredential.user.uid
        });

        // Send password reset email
        await auth.sendPasswordResetEmail(adminData.email);

        console.log('✅ Admin user created successfully!');
        console.log('📧 Password reset email sent to:', adminData.email);
        console.log('🔑 Temporary password: admin123456');
        console.log('👤 Admin user ready to use!');

        return userCredential.user;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('⚠️ Admin user already exists');
            
            // Try to sign in to get user ID
            try {
                const userCredential = await auth.signInWithEmailAndPassword(
                    'nahidwebdesigner@gmail.com', 
                    'admin123456'
                );
                
                // Update user document
                await db.collection('users').doc(userCredential.user.uid).set({
                    email: 'nahidwebdesigner@gmail.com',
                    name: 'Nahid',
                    role: 'admin',
                    department: 'Web Design',
                    createdAt: new Date().toISOString(),
                    status: 'active',
                    uid: userCredential.user.uid
                }, { merge: true });

                console.log('✅ Admin user updated successfully!');
                return userCredential.user;
            } catch (signInError) {
                console.error('❌ Error updating admin user:', signInError.message);
            }
        } else {
            console.error('❌ Error creating admin user:', error.message);
        }
    }
};

// Run the setup
createAdminUser();