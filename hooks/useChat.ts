import { useEffect, useState } from 'react';
import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';
import { MemberRequest, creatorUser } from '@/types';
import { useUser } from '@clerk/nextjs';

interface Chat {
    startedAt: number;
    endedAt?: number;
    messages: {
        senderId: string;
        text: string;
        createdAt: Timestamp;
        img: string;
        audio: string;
        seen: boolean;
    }[];
}

interface User2 {
    _id: string;
    clientId: string;
    creatorId: string;
    request: string;
    fullName: string;
    photo: string;
}

const useChat = () => {
    const [chat, setChat] = useState<Chat | undefined>();
    const [chatEnded, setChatEnded] = useState(false);
    const [startedAt, setStartedAt] = useState<number>();
    const [creator, setCreator] = useState<creatorUser>()
    const [endedAt, setEndedAt] = useState<number | undefined>();
    const [duration, setDuration] = useState<number | undefined>();
    const [amount, setAmount] = useState<number | undefined>(); // Use state for amount
    const [chatRatePerMinute, setChatRatePerMinute] = useState(0);
    const [user2, setUser2] = useState<User2 | undefined>();
    const [flag, setFlag] = useState(true)
    const { chatId } = useParams();
    const router = useRouter();
    const { user } = useUser();
    const pathname = usePathname();

    useEffect(() => {
        const storedCreator = localStorage.getItem("currentCreator");
        if (storedCreator) {
            const parsedCreator: creatorUser = JSON.parse(storedCreator);
            setCreator(parsedCreator);
            if (parsedCreator.chatRate) {
                setChatRatePerMinute(parseInt(parsedCreator.chatRate, 10));
            }
        }
    }, [chatId]);

    useEffect(() => {
        if (chatId) {

            const unSub = onSnapshot(doc(db, "chats", chatId as string), (res: any) => {
                setChat(res.data());
                setStartedAt(res.data().startedAt as number);
                setChatEnded(res.data()?.status === "ended");
                if (res.data()?.status === "ended") {
                    setEndedAt(res.data().endedAt); // Update endedAt using useState
                }
            });
            return () => unSub();
        }
    }, [chatId]);

    useEffect(() => {
        if (chatEnded && startedAt && endedAt) {
            const chatDuration = endedAt - startedAt;
            setDuration(chatDuration);
            const chatDurationMinutes = chatDuration / (1000 * 60); // Convert milliseconds to minutes
            const calculatedAmount = chatDurationMinutes * chatRatePerMinute;
            setAmount(calculatedAmount);
        }
    }, [chatEnded, startedAt, endedAt, chatRatePerMinute]);

    const members: MemberRequest[] = [
        {
            user_id: "66743489cc9b328a2c2adb5c",
            // user_id: "66681d96436f89b49d8b498b",
            custom: {
                name: String(creator?.username),
                type: "expert",
                image: String(creator?.photo)
            },
            role: "call_member",
        },
        {
            user_id: String(user?.publicMetadata?.userId),
            custom: {
                name: String(user?.username),
                type: "client",
                image: String(user?.imageUrl)
            },
            role: "admin",
        },
    ];


    const createChat = async (chatId: string, status: string) => {
        console.log("inside", flag)
        const [existingChat] = await Promise.all([
            fetch(`/api/v1/calls/getChat?chatId=${chatId}`).then(
                (res) => res.json()
            ),
        ]);

        if (existingChat) {
            if (status === "rejected") {
                await fetch("/api/v1/calls/updateChat", {
                    method: "PUT",
                    body: JSON.stringify({
                        chatId,
                        endedAt,
                        startedAt: Date.now(),
                        duration,
                        status
                    }),
                });
            } else {
                if (startedAt && endedAt && duration) {
                    await fetch("/api/v1/calls/updateChat", {
                        method: "PUT",
                        body: JSON.stringify({
                            chatId,
                            endedAt,
                            startedAt,
                            duration,
                            status
                        }),
                    });
                }
            }
        } else {
            if (status === "rejected") {
                await fetch("/api/v1/calls/registerChat", {
                    method: "POST",
                    body: JSON.stringify({
                        chatId: chatId,
                        creator: user2?.clientId,
                        status: status,
                        members: members,
                        startedAt: Date.now(),
                        endedAt: endedAt,
                        duration: duration
                    })
                })
            } else {
                if (startedAt && endedAt && duration) {
                    await fetch("/api/v1/calls/registerChat", {
                        method: "POST",
                        body: JSON.stringify({
                            chatId: chatId,
                            creator: user2?.clientId,
                            status: status,
                            members: members,
                            startedAt: startedAt,
                            endedAt: endedAt,
                            duration: duration
                        })
                    })
                }
            }
        }
    }

    if(duration && endedAt && amount && flag){
        console.log("outside",flag)
        setFlag(false);
        createChat(chatId as string, "ended"); 
    }

    console.log("useChat");

    return { duration, amount, createChat };
};

export default useChat;
