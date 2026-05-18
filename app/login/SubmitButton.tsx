'use client'

import { useFormStatus } from 'react-dom'

export default function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? 'Wird verarbeitet...' : label}
    </button>
  )
}
