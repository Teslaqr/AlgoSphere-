// src/components/CountdownTimer.jsx
import { useCallback, useEffect, useState } from 'react'

const CountdownTimer = ({ targetDate, early = false, setCurrentTime, compact = false }) => {
  const calculateTimeLeft = useCallback(() => {
    const difference = new Date(targetDate) - new Date()
    let timeLeft = {}
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      }
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    }
    return timeLeft
  }, [targetDate])

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())

  useEffect(() => {
    const timer = setInterval(() => {
      const updatedTimeLeft = calculateTimeLeft()
      setTimeLeft(updatedTimeLeft)
      if (early && new Date() >= new Date(targetDate)) {
        setCurrentTime(new Date())
        clearInterval(timer)
      }
    }, 1000)

    setTimeLeft(calculateTimeLeft())
    return () => clearInterval(timer)
  }, [calculateTimeLeft, early, setCurrentTime, targetDate])

  const units = [
    ['days', 'D'],
    ['hours', 'H'],
    ['minutes', 'M'],
    ['seconds', 'S'],
  ]
  const hasTimeLeft = Object.values(timeLeft).some(Boolean)

  return (
    <div className={compact ? 'text-left' : 'mt-10 text-2xl'}>
      {hasTimeLeft ? (
        early ? (
          <>
            {!compact && <p className='mb-2'>Contest starts in:</p>}
            <div className='flex flex-wrap gap-2'>
              {units.map(([unit, label]) => (
                <span className='rounded-md bg-white px-3 py-2 text-center shadow-sm ring-1 ring-slate-200' key={unit}>
                  <span className='block text-xl font-bold text-slate-950'>{timeLeft[unit]}</span>
                  <span className='text-xs font-semibold uppercase text-slate-500'>{label}</span>
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            {!compact && <p className='mb-2'>Time remaining:</p>}
            <div className='flex flex-wrap gap-2'>
              {units.map(([unit, label]) => (
                <span className='rounded-md bg-white px-3 py-2 text-center shadow-sm ring-1 ring-slate-200' key={unit}>
                  <span className='block text-xl font-bold text-slate-950'>{timeLeft[unit]}</span>
                  <span className='text-xs font-semibold uppercase text-slate-500'>{label}</span>
                </span>
              ))}
            </div>
          </>
        )
      ) : (
        <>
          {early ? (
            <span className='text-gray-900'>Contest has started!</span>
          ) : (
            <>
              <span className='text-gray-900'>Contest over</span>
              {targetDate && <p className='text-gray-900 mt-2'>Ended at: {new Date(targetDate).toLocaleString()}</p>}
            </>
          )}
        </>
      )}
    </div>
  )
}

export default CountdownTimer
