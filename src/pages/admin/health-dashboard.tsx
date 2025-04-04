import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format, parseISO, isBefore, isAfter } from 'date-fns'

interface HealthData {
  id: string
  created_at: string
  patient_name: string
  weight: number
  height: number
  bmi: number
  blood_pressure: string
  blood_sugar: number
}

interface Filters {
  from: string
  to: string
}

export default function HealthDashboard() {
  const [healthData, setHealthData] = useState<HealthData[]>([])
  const [filters, setFilters] = useState<Filters>({
    from: '',
    to: '',
  })

  useEffect(() => {
    fetchHealthData()
  }, [])

  const fetchHealthData = async () => {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching health data:', error)
      return
    }

    setHealthData(data || [])
  }

  const applyFilter = () => {
    const f = healthData.filter((record) => {
      const createdAt = parseISO(record.created_at)
      if (filters.from && isBefore(createdAt, parseISO(filters.from))) return false
      if (filters.to && isAfter(createdAt, parseISO(filters.to))) return false
      return true
    })
    return f
  }

  const filteredData = applyFilter()

  return (
    <div className="container mx-auto py-10">
      <div className="flex gap-4 mb-8">
        <input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          className="border rounded p-2"
        />
        <input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          className="border rounded p-2"
        />
      </div>
      <div className="space-y-4">
        {filteredData.map((record) => (
          <div key={record.id} className="border rounded p-4">
            <div>
              <p><strong>{record.patient_name}</strong></p>
              <p>{format(parseISO(record.created_at), 'yyyy-MM-dd HH:mm')}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p>Weight: {record.weight} kg</p>
                <p>Height: {record.height} cm</p>
                <p>BMI: {record.bmi.toFixed(1)}</p>
              </div>
              <div>
                <p>Blood Pressure: {record.blood_pressure}</p>
                <p>Blood Sugar: {record.blood_sugar} mg/dL</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 