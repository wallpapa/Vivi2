import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { format, parse, isSameMonth, differenceInCalendarDays } from 'date-fns'

interface TopEarner {
  staff_name: string;
  role: string;
  total: number;
}

function hasFiveDayStreak(dates: string[]): boolean {
  const sorted = Array.from(new Set(dates.map((d) => d.slice(0, 10)))).sort()
  let streak = 1
  for (let i = 1; i < sorted.length; i++) {
    const prev = parse(sorted[i - 1])
    const current = parse(sorted[i])
    if (differenceInCalendarDays(current, prev) === 1) {
      streak++
      if (streak >= 5) return true
    } else {
      streak = 1
    }
  }
  return false
}

export default function CompensationLeaderboard() {
  const [topEarners, setTopEarners] = useState<TopEarner[]>([])
  const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'))
  const [staffDatesMap, setStaffDatesMap] = useState<Record<string, string[]>>({})

  useEffect(() => {
    const fetchTopEarners = async () => {
      const { data } = await supabase
        .from('payments')
        .select('staff_name, role, amount, created_at')
        .eq('status', 'completed')

      const filtered = data?.filter((entry) =>
        isSameMonth(parse(entry.created_at), parse(`${month}-01`))
      )

      const summary: Record<string, { role: string; total: number }> = {}
      const datesMap: Record<string, string[]> = {}

      filtered?.forEach((entry) => {
        const name = entry.staff_name || '-'
        if (!summary[name]) {
          summary[name] = { role: entry.role, total: 0 }
          datesMap[name] = []
        }
        summary[name].total += entry.amount || 0
        datesMap[name].push(entry.created_at)
      })

      setStaffDatesMap(datesMap)

      const sorted = Object.entries(summary)
        .map(([staff_name, info]) => ({ staff_name, ...info }))
        .sort((a, b) => b.total - a.total)

      setTopEarners(sorted)
    }

    fetchTopEarners()
  }, [month])

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">🏆 Leaderboard ค่าตอบแทนรายเดือน</h1>

      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="border p-2 rounded"
      />

      <ol className="space-y-3 mt-6">
        {topEarners.map((person, index) => (
          <li
            key={person.staff_name}
            className={`p-4 border rounded flex items-center justify-between ${
              index === 0
                ? 'bg-yellow-100'
                : index === 1
                ? 'bg-gray-100'
                : index === 2
                ? 'bg-orange-100'
                : ''
            }`}
          >
            <div className="flex gap-3 items-center">
              <span className="text-xl font-bold">{index + 1}</span>
              <div>
                <p className="font-semibold">{person.staff_name}</p>
                <p className="text-sm text-gray-600">{person.role}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-600 font-semibold">
                {person.total.toLocaleString()} บาท
              </p>
              {person.total >= 100000 && <p className="text-sm mt-1">💎 100K Club</p>}
              {hasFiveDayStreak(staffDatesMap[person.staff_name] || []) && (
                <p className="text-sm text-orange-500">🔥 5 Days in a Row</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
} 