import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !geminiApiKey) {
      console.error('Missing environment variables for Chat API');
      return NextResponse.json(
        { error: 'Server configuration incomplete' }, 
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const genAI = new GoogleGenerativeAI(geminiApiKey);

    // 1. Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Verify the user with Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Parse the request body
    const { message, userId, history } = await req.json();

    // 4. Security Check: Ensure the userId in the request matches the authenticated user's ID
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Identity mismatch detected' }, 
        { status: 401 }
      );
    }

    // 5. Generate AI Response using Gemini
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "Você é o Curador Digital do Elo Escolar, um assistente inteligente para uma instituição de ensino em Angola. Ajude alunos, professores e administradores com dúvidas sobre a escola, pagamentos, notas e calendário. Seja profissional, prestativo e fale em Português de Angola.",
    });
    
    const chat = model.startChat({
      history: history || []
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();

    return NextResponse.json({ response: responseText });

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}
