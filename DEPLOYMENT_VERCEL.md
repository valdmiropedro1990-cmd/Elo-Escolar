# Guia de Deploy Vercel + Supabase 🚀

Este documento ajuda-te a configurar o teu projeto **Elo Escolar** no Vercel e Supabase para que tudo funcione corretamente.

## 1. Configurar o Supabase (Base de Dados)

1.  Cria um projeto no [Supabase](https://supabase.com/).
2.  Vai ao menu **SQL Editor** no painel do Supabase.
3.  Copia o conteúdo do ficheiro `supabase_setup.sql` deste repositório e cola no SQL Editor.
4.  Clica em **Run**. Isto vai criar todas as tabelas e políticas de segurança.

## 2. Configurar o Vercel

1.  Importa o teu repositório do GitHub no [Vercel](https://vercel.com/import).
2.  Na etapa de configuração, abre a seção **Environment Variables**.
3.  Adiciona as seguintes chaves (podes copiar os valores do painel do Supabase > Settings > API):

| Chave | Descrição |
| :--- | :--- |
| `NEXT_PUBLIC_GEMINI_API_KEY` | A tua chave da API do Gemini (AI Studio). |
| `NEXT_PUBLIC_SUPABASE_URL` | O URL do teu projeto Supabase. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | A "anon key" do Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | A "service_role key" (necessária para funções administrativas). |

## 3. Storage (Upload de Documentos)

Se o teu sistema usar upload de fotos ou comprovativos:
1.  Vai ao painel do Supabase > **Storage**.
2.  Cria um bucket chamado `payment-proofs` (ou o nome usado no código).
3.  Define o bucket como **Public**.

## 4. Notas Importantes para o Build

*   O arquivo `/app/api/chat/route.ts` já foi corrigido para permitir builds no Vercel mesmo se as chaves de API estiverem ausentes durante a compilação (Lazy Initialization).
*   Certifica-se de que o **Framework Preset** no Vercel está definido como `Next.js`.

---
Qualquer dúvida, consulta o ficheiro `supabase_setup.sql` para ver a estrutura da base de dados.
