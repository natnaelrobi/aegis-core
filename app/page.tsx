'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client directly using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cieicuvkhisjqjrwdgaa.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Region {
  id: number
  region_key: string
  name: string
  lat: number
  lon: number
  zone: string
  pcode: string
  risk_level: string
  flood_prob: number
  drought_prob: number
  exposed_pop: string
}

export default function Dashboard() {
  const [regions, setRegions] = useState<Region[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTelemetry() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('regions')
          .select('*')
          .order('name', { ascending: true })

        if (error) {
          throw error
        }

        setRegions(data || [])
      } catch (err: any) {
        console.error('Error fetching regions:', err.message)
        setErrorMsg(err.message)
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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-8 border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Live System Online</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">AEGIS-Core Command Center</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time Flood & Drought Telemetry and Regional Risk Monitoring</p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search regions or zones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-32">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-950/50 border border-red-800/50 text-red-200 p-4 rounded-xl text-center">
            <p className="font-semibold">Failed to load telemetry data</p>
            <p className="text-sm text-red-300 mt-1">{errorMsg}</p>
          </div>
        ) : filteredRegions.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-2xl p-12 text-center text-slate-400">
            <p className="text-lg font-medium">No region records found</p>
            <p className="text-sm mt-1">Check your Supabase table data or search filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRegions.map((region) => {
              const riskColor =
                region.risk_level?.toLowerCase() === 'high'
                  ? 'bg-red-500/10 text-red-400 border-red-500/20'
                  : region.risk_level?.toLowerCase() === 'medium'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'

              return (
                <div
                  key={region.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-mono text-slate-500 uppercase">{region.pcode || 'N/A'}</span>
                        <h2 className="text-xl font-bold text-white mt-0.5">{region.name}</h2>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${riskColor}`}>
                        {region.risk_level || 'Unknown'} Risk
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-medium mb-4">Zone: {region.zone || 'General'}</p>

                    <div className="space-y-3 pt-3 border-t border-slate-800 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Flood Probability</span>
                        <span className="font-semibold text-cyan-400">
                          {region.flood_prob !== null ? `${(region.flood_prob * 100).toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Drought Probability</span>
                        <span className="font-semibold text-orange-400">
                          {region.drought_prob !== null ? `${(region.drought_prob * 100).toFixed(1)}%` : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Exposed Population</span>
                        <span className="font-semibold text-slate-200">{region.exposed_pop || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs font-mono text-slate-500">
                    <span>LAT: {region.lat ?? '0.00'}</span>
                    <span>LON: {region.lon ?? '0.00'}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
