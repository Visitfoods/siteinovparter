import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;
  const hyperbolicKey = process.env.HYPERBOLIC_API_KEY;
  
  return NextResponse.json({ 
    openrouter: {
      configured: Boolean(openrouterKey && openrouterKey.length > 10),
      key: openrouterKey ? `${openrouterKey.substring(0, 10)}...` : 'Not found'
    },
    openai: {
      configured: Boolean(openaiKey && openaiKey.length > 10),
      key: openaiKey ? `${openaiKey.substring(0, 10)}...` : 'Not found'
    },
    hyperbolic: {
      configured: Boolean(hyperbolicKey && hyperbolicKey.length > 10),
      key: hyperbolicKey ? `${hyperbolicKey.substring(0, 10)}...` : 'Not found'
    },
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('OPENROUTER') || key.includes('OPENAI') || key.includes('HYPERBOLIC')
    )
  });
}


