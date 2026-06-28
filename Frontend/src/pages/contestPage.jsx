import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  FaCheckCircle,
  FaClock,
  FaExternalLinkAlt,
  FaRegCalendarAlt,
  FaUsers,
} from 'react-icons/fa'
import Spinner from '../components/Spinner'
import CountdownTimer from '../components/CountdownTimer'
import CopyUrl from '../components/CopyUrl'
import { apiUrl } from '../utils/api'

const formatDateTime = (date) => (
  new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
)

const getStatus = (started, ended) => {
  if (ended) return { label: 'Ended', className: 'bg-slate-200 text-slate-700' }
  if (started) return { label: 'Live', className: 'bg-emerald-100 text-emerald-700' }
  return { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' }
}

const ContestPage = () => {
  const { id } = useParams()
  const [contestData, setContestData] = useState(null)
  const [solvedByProblem, setSolvedByProblem] = useState({})
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await fetch(apiUrl(`/api/contests/${id}`))
        const data = await res.json()
        setContestData(data.ok === false ? null : data)
      } catch (error) {
        console.error('Error fetching contest:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContest()
  }, [id])

  useEffect(() => {
    if (!contestData) return

    const fetchProgress = async () => {
      try {
        const res = await fetch(apiUrl(`/api/contests/${id}/progress`))
        const data = await res.json()
        if (data.ok) {
          setSolvedByProblem(data.solvedByProblem || {})
        }
      } catch (error) {
        console.error('Error fetching contest progress:', error)
      }
    }

    fetchProgress()
    const interval = setInterval(fetchProgress, 30000)
    return () => clearInterval(interval)
  }, [contestData, id])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <Spinner loading={true} />
  }

  if (!contestData) {
    return <p className='mt-10 text-center text-red-500'>Contest not found.</p>
  }

  const { startTime, duration, problems = [], contestants = [] } = contestData
  const timeStart = new Date(startTime)
  const timeEnding = new Date(timeStart.getTime() + duration * 60000)
  const contestStarted = currentTime >= timeStart
  const contestEnded = currentTime >= timeEnding
  const status = getStatus(contestStarted, contestEnded)
  const solvedCount = problems.filter((problem) => (
    solvedByProblem[`${problem.contestId}-${problem.index}`]?.length > 0
  )).length

  return (
    <main className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
      <section className='overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200'>
        <div className='bg-slate-950 px-6 py-6 text-white sm:px-8'>
          <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
            <div>
              <div className='mb-3 flex flex-wrap items-center gap-3'>
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${status.className}`}>
                  {status.label}
                </span>
                <span className='text-sm text-slate-300'>Contest ID: {id}</span>
              </div>
              <h1 className='text-3xl font-bold tracking-tight sm:text-4xl'>Custom Codeforces Contest</h1>
              <p className='mt-3 max-w-2xl text-sm text-slate-300'>
                Solve the selected problems during the contest window. Progress refreshes automatically from Codeforces.
              </p>
            </div>
            <CopyUrl />
          </div>
        </div>

        <div className='grid gap-4 border-b border-slate-200 bg-slate-50 p-6 sm:grid-cols-2 lg:grid-cols-4'>
          <div className='rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200'>
            <div className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
              <FaUsers /> Participants
            </div>
            <p className='mt-2 text-lg font-bold text-slate-950'>
              {contestants.length ? contestants.join(', ') : 'No participants listed'}
            </p>
          </div>
          <div className='rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200'>
            <div className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
              <FaRegCalendarAlt /> Starts
            </div>
            <p className='mt-2 text-lg font-bold text-slate-950'>{formatDateTime(timeStart)}</p>
          </div>
          <div className='rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200'>
            <div className='flex items-center gap-2 text-sm font-semibold text-slate-500'>
              <FaClock /> Duration
            </div>
            <p className='mt-2 text-lg font-bold text-slate-950'>{duration} minutes</p>
          </div>
          <div className='rounded-md bg-white p-4 shadow-sm ring-1 ring-slate-200'>
            <div className='text-sm font-semibold text-slate-500'>Solved</div>
            <p className='mt-2 text-lg font-bold text-slate-950'>{solvedCount} / {problems.length}</p>
          </div>
        </div>

        <div className='flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-semibold uppercase tracking-wide text-slate-500'>
              {!contestStarted ? 'Contest starts in' : contestEnded ? 'Contest ended' : 'Time remaining'}
            </p>
            {contestEnded ? (
              <p className='mt-2 text-lg font-semibold text-slate-900'>Ended at {formatDateTime(timeEnding)}</p>
            ) : (
              <div className='mt-3'>
                <CountdownTimer
                  compact
                  early={!contestStarted}
                  targetDate={contestStarted ? timeEnding : timeStart}
                  setCurrentTime={setCurrentTime}
                />
              </div>
            )}
          </div>
          <div className='rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-800'>
            Problems unlock when the contest starts.
          </div>
        </div>

        {!contestStarted ? (
          <div className='p-10 text-center'>
            <h2 className='text-2xl font-bold text-slate-950'>Problems are hidden for now</h2>
            <p className='mx-auto mt-3 max-w-xl text-slate-600'>
              Share the contest link with your teammates. The problem list will appear automatically at start time.
            </p>
          </div>
        ) : (
          <div className='p-4 sm:p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h2 className='text-xl font-bold text-slate-950'>Problems</h2>
              <span className='text-sm text-slate-500'>Auto-refreshes every 30 seconds</span>
            </div>

            <div className='divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200'>
              {problems.map((problem, index) => {
                const key = `${problem.contestId}-${problem.index}`
                const solvers = solvedByProblem[key] || []

                return (
                  <article className='bg-white p-4 transition hover:bg-slate-50 sm:p-5' key={key}>
                    <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                      <div className='min-w-0'>
                        <div className='mb-2 flex flex-wrap items-center gap-2'>
                          <span className='rounded-md bg-slate-950 px-2.5 py-1 text-sm font-bold text-white'>
                            {index + 1}
                          </span>
                          <span className='rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800'>
                            {problem.rating || 'Unrated'}
                          </span>
                          <span className='text-xs font-medium text-slate-500'>
                            {problem.contestId}{problem.index}
                          </span>
                        </div>
                        <a
                          href={problem.url || `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex max-w-full items-center gap-2 text-lg font-bold text-blue-700 hover:text-blue-900 hover:underline'
                        >
                          <span className='truncate'>{problem.name}</span>
                          <FaExternalLinkAlt className='shrink-0 text-sm' />
                        </a>
                        <div className='mt-3 flex flex-wrap gap-2'>
                          {(problem.tags || []).slice(0, 5).map((tag) => (
                            <span className='rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600' key={tag}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className='shrink-0 text-left md:text-right'>
                        {solvers.length > 0 ? (
                          <div className='inline-flex items-center rounded-full bg-emerald-100 px-3 py-2 text-sm font-semibold text-emerald-700'>
                            <FaCheckCircle className='mr-2' />
                            Solved by {solvers.join(', ')}
                          </div>
                        ) : (
                          <span className='inline-flex rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-500'>
                            Not solved yet
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default ContestPage
