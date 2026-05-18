'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    const msg = error.message?.toLowerCase() ?? ''
    if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
      redirect('/login?error=' + encodeURIComponent('Bitte bestätige zuerst deine E-Mail-Adresse. Schau in dein Postfach (auch Spam).'))
    }
    redirect('/login?error=' + encodeURIComponent('E-Mail oder Passwort falsch.'))
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  const isAllowed = email.endsWith('@hs-koblenz.de') || email === '08muhammed80@gmail.com'
  if (!isAllowed) {
    redirect('/register?error=' + encodeURIComponent('Nur HS-Koblenz E-Mail-Adressen (@hs-koblenz.de) sind erlaubt.'))
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: 'https://studyhub-5wqkfq1ft-muhammed-avsar-s-projects.vercel.app/login?verified=true',
    },
  })

  if (error) {
    const msg = error.message?.toLowerCase() ?? ''
    if (msg.includes('security purposes') || msg.includes('after') || msg.includes('rate')) {
      redirect('/register?error=' + encodeURIComponent('Bitte warte kurz und versuche es dann erneut.'))
    }
    if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('duplicate')) {
      redirect('/register?error=' + encodeURIComponent('Diese E-Mail-Adresse ist bereits registriert. Bitte einloggen.'))
    }
    redirect('/register?error=' + encodeURIComponent(error.message))
  }

  redirect('/register?success=true')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
