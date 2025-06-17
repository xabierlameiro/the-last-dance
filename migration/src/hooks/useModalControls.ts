'use client'

import { useRouter } from 'next/navigation'
import { useDialog } from '@/context/dialog'

export function useModalControls() {
    const router = useRouter()
    const { dispatch } = useDialog()

    const close = () => {
        dispatch({ type: 'close' })
        // Opcional: también navegar hacia atrás
        // router.back()
    }

    const minimize = () => {
        // Implementar lógica de minimizado
        // Podrías usar el contexto de dialog o state local
        console.log('Minimize modal')
    }

    const fullscreen = (isFullscreen: boolean) => {
        // Implementar lógica de fullscreen
        console.log('Fullscreen modal:', isFullscreen)
    }

    return {
        close,
        minimize,
        fullscreen
    }
}
