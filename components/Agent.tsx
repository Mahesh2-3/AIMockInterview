'use client'
import { interviewer } from '@/constants';
import { cn } from '@/lib/utils'
import { vapi } from '@/lib/vapi.sdk';
import Image from 'next/image'
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

enum CallStatus {
    INACTIVE = 'INACTIVE',
    CONNECTING = 'CONNECTING',
    ACTIVE = 'ACTIVE',
    FINISHED = 'FINISHED'
}

interface SavedMessages {
    role: 'user' | 'system' | 'assistant';
    content: string
}
const Agent = ({ userName, userId, type,questions }: AgentProps) => {
    const router = useRouter()
    const [isSpeaking, setisSpeaking] = useState(false)
    const [callStatus, setcallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
    const [messages, setMessages] = useState<SavedMessages[]>([])

    useEffect(() => {
        const onCallStart = () => (CallStatus.ACTIVE);
        const OnCallEnd = () => setcallStatus(CallStatus.FINISHED);

        const onMessage = (message: Message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role, content: message.transcript }
                setMessages((prev) => [...prev, newMessage])
            }
        }
        const onSpeechStart = () => setisSpeaking(true);
        const onSpeechEnd = () => setisSpeaking(false);
        const onError = (error: Error) => console.log('Error', error)

        vapi.on('call-start', onCallStart)
        vapi.on('call-end', OnCallEnd)
        vapi.on('message', onMessage)
        vapi.on('speech-start', onSpeechStart)
        vapi.on('speech-end', onSpeechEnd)
        vapi.on('error', onError)

        return () => {
            vapi.off('call-start', onCallStart)
            vapi.off('call-end', OnCallEnd)
            vapi.off('message', onMessage)
            vapi.off('speech-start', onSpeechStart)
            vapi.off('speech-end', onSpeechEnd)
            vapi.off('error', onError)
        }

    }, [])

    useEffect(() => {
        if (callStatus === CallStatus.FINISHED) router.push('/')
    }, [messages, callStatus, userId, type])


    const handleCall = async () => {
        setcallStatus(CallStatus.CONNECTING);

        if (type === "generate") {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
                variableValues: {
                    username: userName,
                    userid: userId,
                },
            });
        } else {
            let formattedQuestions = "";
            console.log(questions)
            if (questions) {
                formattedQuestions = questions
                    .map((question) => `- ${question}`)
                    .join("\n");
            }

            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions,
                },
            });
        }
    };
    const handleDisconnectCall = async () => {
        setcallStatus(CallStatus.FINISHED)
        vapi.stop()
    }

    const latestmessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished = callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;



    return (
        <>
            <div className='call-view'>
                <div className='card-interviewer'>
                    <div className="avatar">
                        <Image src={"/ai-avatar.png"} alt='vapi' width={65} height={54} className='object-cover' />
                        {isSpeaking && <span className='animate-speak' />}
                    </div>
                    <h3>AI Interviewer</h3>
                </div>
                <div className="card-border">
                    <div className="card-content">
                        <Image src={"/user-avatar.png"} alt='user-avatar' width={540} height={540} className='rounded-full object-cover size-[120px]' />
                        <h3>{userName}</h3>
                    </div>
                </div>
            </div>
            {messages.length > 0 &&
                <div className="transcript-border">
                    <div className="transcript">
                        <p key={latestmessage} className={cn('transition-opacity duration-500 opacity-0', 'animate-fadeIn opacity-100')}>
                            {latestmessage}
                        </p>
                    </div>
                </div>
            }
            <div className="w-full flex justify-center">
                {callStatus !== 'ACTIVE' ?
                    <button className='relative btn-call' onClick={handleCall}>
                        <span className={cn('absolute animate-plug rounded-full opacity-75', callStatus !== 'CONNECTING' && 'hidden')} />
                        <span>
                            {isCallInactiveOrFinished ? 'Call' : ". . ."}
                        </span>
                    </button> :
                    <button className='btn-disconnect' onClick={handleDisconnectCall}>End</button>
                }
            </div>
        </>
    )
}

export default Agent
