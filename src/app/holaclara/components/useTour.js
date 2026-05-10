'use client'
import { useState, useEffect } from 'react'

export function useTour() {
  const [mostrarTour, setMostrarTour] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const tourCompletado = localStorage.getItem('hc_tour_completado')
      if (!tourCompletado) {
        setTimeout(() => setMostrarTour(true), 1800)
      }
    } catch (e) {
      // localStorage no disponible
    }
  }, [])

  const completarTour = () => {
    try { localStorage.setItem('hc_tour_completado', 'true') } catch (e) {}
    setMostrarTour(false)
  }

  const resetTour = () => {
    try { localStorage.removeItem('hc_tour_completado') } catch (e) {}
    setMostrarTour(true)
  }

  return { mostrarTour: mounted && mostrarTour, completarTour, resetTour }
}
