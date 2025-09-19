import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const initFirebaseAdmin =()=>{
    const apps = getApps();

    if(!apps.length){
        initializeApp({
            credential:cert({
                projectId:process.env.FIREBASE_PROJECTID,
                privateKey:process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g,'\n'),
                clientEmail:process.env.FIREBASE_CLIENT_EMAIL
            })
        })
    }
    return{
        auth:getAuth(),
        db:getFirestore()
    }
}

export const {auth,db} = initFirebaseAdmin()