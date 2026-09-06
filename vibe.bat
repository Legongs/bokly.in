#!/bin/bash

# Validasi input pesan commit
if [ -z "$1" ]; then
  echo "Cara penggunaan: ./vibe.sh \"pesan commit Anda\""
  exit 1
fi

echo "Menyinkronkan skema database..."
supabase db push

echo "Merekam perubahan Git..."
git add .
git commit -m "$1"

echo "Mendorong ke Vercel..."
git push origin main

echo "Selesai! Vercel auto-deploy sedang berjalan."