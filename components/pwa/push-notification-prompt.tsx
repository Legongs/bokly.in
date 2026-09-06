"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { savePushSubscription } from "@/lib/actions/push-notification.actions";

export function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushNotificationPromptProps {
  subscriptionType: "dashboard" | "storefront";
  message?: string;
}

export function PushNotificationPrompt({
  subscriptionType,
  message,
}: PushNotificationPromptProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ("Notification" in window && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      
      // Cek apakah sudah subscribe
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          console.error("VAPID public key is missing");
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        // Simpan ke DB
        const result = await savePushSubscription(subscription, subscriptionType);
        if (result.success) {
          setIsSubscribed(true);
        }
      }
    } catch (error) {
      console.error("Failed to subscribe to push notifications", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported || isSubscribed || permission === "denied") {
    return null;
  }

  const defaultMessage =
    subscriptionType === "dashboard"
      ? "Dapatkan notifikasi instan setiap ada booking baru"
      : "Dapatkan notifikasi update status booking kamu";

  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between my-4">
      <div className="flex gap-3 items-start">
        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 mt-0.5">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-indigo-900">Aktifkan Notifikasi</h4>
          <p className="text-sm text-indigo-700 mt-1">
            {message || defaultMessage}
          </p>
        </div>
      </div>
      <button
        onClick={handleSubscribe}
        disabled={isLoading}
        className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
      >
        {isLoading ? "Mengaktifkan..." : "Aktifkan"}
      </button>
    </div>
  );
}
