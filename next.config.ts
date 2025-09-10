import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuração da API
  experimental: {
    serverActions: true,
  },

  // Configuração para imagens de domínios externos
  images: {
    domains: [
      'visitfoods.pt',
      'virtualguide.info',
      'lhwp3192.webapps.net'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'visitfoods.pt',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'virtualguide.info',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lhwp3192.webapps.net',
        port: '',
        pathname: '/**',
      }
    ],
  },

  // Configuração para servir ficheiros VTT com o Content-Type correto
  async headers() {
    return [
      {
        source: '/legendas.vtt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/vtt; charset=utf-8',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/legendas-desktop.vtt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/vtt; charset=utf-8',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/legendas-mobile.vtt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/vtt; charset=utf-8',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/legendas-tablet.vtt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/vtt; charset=utf-8',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/videos da pagina/Legendas pc.vtt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/vtt; charset=utf-8',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/videos da pagina/Legendas Tablet.vtt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/vtt; charset=utf-8',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
      {
        source: '/videos da pagina/Legendas Mobile.vtt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/vtt; charset=utf-8',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Garantir que as variáveis de ambiente são carregadas
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  }
};

export default nextConfig;