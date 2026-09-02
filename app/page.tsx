'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cieicuvkhisjqjrwdgaa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpZWljdXZraGlzanFqcndkZ2FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNzk1NTAsImV4cCI6MjEwMzg1NTU1MH0.ZO_0WXHV8-y8csW9BZW19xqoQEjHpwDFefy3mIoK3k8'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Region {
  id: number
  region_key: string
  name: string
  lat: number
  lon: number
  zone: string
  risk_level: string
  flood_prob: number
  drought_prob: number
}

// Utility to generate dates
const getNext7Days = () => {
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  })
}

export default function Dashboard() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  useEffect(() => {
    async function fetchTelemetry() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from('regions').select('*').order('name', { ascending: true })
        if (error) throw error
        setRegions(data || [])
      } catch (err: any) {
        console.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchTelemetry()
  }, [])

  const filteredRegions = regions.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.zone.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const forecastDates = getNext7Days()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans relative">
      <header className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Predictive Models Online</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">AEGIS-Core Command Center</h1>
        </div>
        <input
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-72 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm focus:border-emerald-500 transition-colors"
        />
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-400">Loading predictive models...</p>
        ) : (
          filteredRegions.map((region) => (
            <div key={region.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{region.name}</h2>
                <p className="text-xs text-slate-400 mb-4">{region.zone}</p>
                <div className="space-y-2 text-sm border-t border-slate-800 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Flood Risk</span>
                    <span className="text-cyan-400 font-semibold">{(region.flood_prob * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Drought Risk</span>
                    <span className="text-orange-400 font-semibold">{(region.drought_prob * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedRegion(region)}
                className="mt-6 w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
              >
                7-Day Forecast & Hourly Analysis
              </button>
            </div>
          ))
        )}
      </div>

      {/* FORECAST MODAL */}
      {selectedRegion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full my-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">Disaster Forecast: {selectedRegion.name}</h3>
                <p className="text-slate-400 text-sm">{selectedRegion.zone} | LAT: {selectedRegion.lat} LON: {selectedRegion.lon}</p>
              </div>
              <button onClick={() => { setSelectedRegion(null); setExpandedDay(null); }} className="text-slate-400 hover:text-white font-bold text-xl">✕</button>
            </div>

            <div className="space-y-4">
              {forecastDates.map((date, dayIndex) => {
                // Simulate changing probabilities over 7 days based on the base model data
                const dayFloodProb = Math.min(100, Math.max(0, (selectedRegion.flood_prob * 100) + (Math.sin(dayIndex) * 15)))
                const dayDroughtProb = Math.min(100, Math.max(0, (selectedRegion.drought_prob * 100) + (Math.cos(dayIndex) * 10)))
                
                return (
                  <div key={dayIndex} className="border border-slate-800 rounded-lg bg-slate-950 overflow-hidden">
                    <div className="p-4 flex justify-between items-center">
                      <div className="font-semibold text-slate-200">{date}</div>
                      <div className="flex gap-4 text-sm">
                        <span className="text-cyan-400">Flood: {dayFloodProb.toFixed(1)}%</span>
                        <span className="text-orange-400">Drought: {dayDroughtProb.toFixed(1)}%</span>
                      </div>
                      <button 
                        onClick={() => setExpandedDay(expandedDay === dayIndex ? null : dayIndex)}
                        className="text-xs bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded hover:bg-emerald-600/40 transition-colors"
                      >
                        {expandedDay === dayIndex ? 'Hide Details' : 'Learn More'}
                      </button>
                    </div>

                    {/* HOURLY BREAKDOWN */}
                    {expandedDay === dayIndex && (
                      <div className="bg-slate-900 p-4 border-t border-slate-800 grid grid-cols-4 sm:grid-cols-6 gap-2 h-48 overflow-y-auto">
                        {Array.from({ length: 24 }).map((_, hour) => {
                          const hourStr = `${hour.toString().padStart(2, '0')}:00`
                          // Add hourly variance to the daily prediction
                          const hourFlood = Math.max(0, dayFloodProb + (Math.sin(hour) * 5)).toFixed(1)
                          const hourDrought = Math.max(0, dayDroughtProb - (Math.sin(hour) * 2)).toFixed(1)
                          
                          return (
                            <div key={hour} className="text-center p-2 bg-slate-950 rounded border border-slate-800 flex flex-col gap-1">
                              <span className="text-xs text-slate-400 font-mono">{hourStr}</span>
                              <span className="text-xs text-cyan-500">{hourFlood}%</span>
                              <span className="text-xs text-orange-500">{hourDrought}%</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
