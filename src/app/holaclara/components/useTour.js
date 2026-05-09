'use client'
import { useState, useEffect } from 'react'

export function useTour() {
  const [mostrarTour, setMostrarTour] = useState(false)

  useEffect(() => {
    const tourCompletado = localStorage.getItem('hc_tour_completado')
    if (!tourCompletado) {
      // Pequeño delay para que la app cargue primero
      setTimeout(() => setMostrarTour(true), 1500)
    }
  }, [])

  const completarTour = () => {
    localStorage.setItem('hc_tour_completado', 'true')
    setMostrarTour(false)
  }

  const resetTour = () => {
    localStorage.removeItem('hc_tour_completado')
    setMostrarTour(true)
  }

  return { mostrarTour, completarTour, resetTour }
}
