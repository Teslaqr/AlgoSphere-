import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Spinner from '../components/Spinner'
import CountdownTimer from '../components/CountdownTimer'
import CopyUrl from '../components/CopyUrl'
import { FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa'

const ContestPage = () => {
  const { id } = useParams()
  const [contestData, setContestData] = useState(null)
  const [solved, setSolved] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContest = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/contests/${id}`)
        const data = await res.json()
        setContestData(data)
      } catch (error) {
        console.error('Error fetching contest:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContest()
  }, [id])

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
    return <p className='text-center text-red-500 mt-10'>Contest not found.</p>
  }

  const { startTime, duration, problems } = contestData
  const timeStart = new Date(startTime)
  const timeEnding = new Date(timeStart.getTime() + duration * 60000)
  const contestStarted = currentTime >= timeStart
  const contestEnded = currentTime >= timeEnding

  return (
    <div className='container mx-auto px-4 py-10 mt-10 bg-gray-50 border border-pink-100 shadow-md rounded-md mb-7'>
      <h1 className='text-4xl text-pink-700 font-bold text-center mb-5'>Contest Page</h1>

      <div className='text-center'>
        {!contestStarted ? (
          <>
            <CountdownTimer early={true} targetDate={timeStart} setCurrentTime={setCurrentTime} />
            <CopyUrl />
          </>
        ) : (
          <>
            {!contestEnded ? (
              <CountdownTimer targetDate={timeEnding} />
            ) : (
              <p className='text-lg text-gray-700 mt-4'>⏱ Contest over. Ended at: {timeEnding.toLocaleString()}</p>
            )}
            <CopyUrl />

            <div className='pt-5'>
              {problems.map((problem, index) => (
                <div className='flex flex-wrap mt-8 justify-center items-center' key={index}>
                  <a
                    href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-800 p-1 rounded-xl ms-3 underline inline-flex items-center'
                  >
                    <span className='font-semibold mr-3'>
                      {index + 1}. {problem.name}
                    </span>
                    <FaExternalLinkAlt />
                  </a>
                  {solved.some(
                    (p) => p.contestId === problem.contestId && p.index === problem.index
                  ) && (
                    <FaCheckCircle className='text-green-500 ms-2' style={{ width: '24px', height: '24px' }} />
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ContestPage
