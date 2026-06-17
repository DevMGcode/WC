'use client';

import { motion } from 'framer-motion';

const WA_CHANNEL_URL = 'https://whatsapp.com/channel/0029VbCSQUjKrWQoNOUmGZ10';

export default function WhatsAppButton() {
  return (
    <motion.a
      href={WA_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      title="Canal oficial de WhatsApp — Orionix Gol"
      aria-label="Únete al canal oficial de WhatsApp de Orionix Gol"
      whileHover={{ scale: 1.12, y: -2 }}
      whileTap={{ scale: 0.93 }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-[146px] right-4 z-40 flex items-center justify-center rounded-full md:bottom-[82px] md:right-6"
      style={{
        width: 42,
        height: 42,
        boxShadow: '0 4px 24px rgba(37,211,102,0.50), 0 0 0 1px rgba(37,211,102,0.25)',
      }}
    >
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" width={42} height={42}>
        <defs>
          <linearGradient id="wa-bg" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1DA851" />
            <stop offset="100%" stopColor="#60D66A" />
          </linearGradient>
        </defs>
        <circle cx="24" cy="24" r="24" fill="url(#wa-bg)" />
        <path
          fill="white"
          d="M34.9 13.1C32.3 10.4 28.8 9 25.1 9c-7.7 0-14 6.3-14 14 0 2.5.6 4.9 1.8 7L11 39l9.2-2.4c2 1.1 4.3 1.7 6.6 1.7h.1c7.7 0 14-6.3 14-14 0-3.7-1.5-7.2-4-9.8l-.0-.4zM25.1 35.6h-.1c-2.1 0-4.2-.6-6-1.6l-.4-.3-4.4 1.2 1.2-4.3-.3-.4c-1.2-1.9-1.8-4-1.8-6.2 0-6.3 5.1-11.4 11.4-11.4 3 0 5.9 1.2 8 3.3 2.1 2.1 3.3 5 3.3 8-.1 6.3-5.2 11.7-11.5 11.7zm6.3-8.5c-.3-.2-2-.9-2.3-1.1-.3-.1-.5-.2-.7.2-.2.3-.8 1-.9 1.3-.2.2-.3.2-.6.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4-.1-.5-.1-.2-.7-1.7-1-2.4-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2.1-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.4z"
        />
      </svg>
    </motion.a>
  );
}
