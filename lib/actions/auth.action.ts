"use server"

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const oneWeek = 60*60*24*7;

export async function signUp(params: SignUpParams){
    const {uid,name,email} = params
    try{
        const userRecord = await db.collection('users').doc(uid).get();
        if(userRecord.exists){
            return{
                success:false,
                message:'User already exists'
            }
        }
        await db.collection('users').doc(uid).set({
            name,
            email,
        })
        return{
            success:true,
            message:'User created successfully'
        }
    }catch(err){
        console.error('Error creating a user',err)
        if(err.code === 'auth/email-already-exists'){
            return{
                success:false,
                message:'This email is already in use'
            }
        }
        return{
            success:false,
            message:'Could not create a user, please try again later'
        }
    }
}

export async function signIn(params: SignInParams){
    const {email,idToken} = params;

    try{
        const userRecord = await auth.getUserByEmail(email);
        if(!userRecord){
            return{
                success:false,
                message:'User does not exist'
            }
        }
        await setSessionCookie(idToken);
        return{
            success:true,
            message:'User signed in successfully'
        }
    }catch(err){
        console.error('Error signing in',err)
        return{
            success:false,
            message:'Could not sign in, please try again later'
        }

    }
}

export async function setSessionCookie( idToken:string){
    const cookieStore = await cookies()
    const sessionCookie = await auth.createSessionCookie(idToken,{
        expiresIn: oneWeek
    })
    cookieStore.set('session',sessionCookie,{
        httpOnly:true,
        maxAge:oneWeek,
        secure:process.env.NODE_ENV === 'production',
        path:'/',
        sameSite:'lax'
})
}


export async function getCurrentUser():Promise<User | null>{
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if(!session){
        return null;
    }
    try{
        const decodedClaims = await auth.verifySessionCookie(session,true);
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
        if(!userRecord.exists){
            return null;
        }
        return {
            ...userRecord.data(),
            id:userRecord.id
        } as User;
    }catch(err){
        console.error('Error fetching current user',err)
    }
}

export async function isAuthenticated(){
    const user = await getCurrentUser();

    return !!user;
}