import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import tagList from '../utils/tags'
import { createContest } from '../services/contestServices'
import Spinner from '../components/Spinner'

const CreateContest = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    codeforcesId1: '',
    codeforcesId2: '',
    codeforcesId3: '',
    numQuestions: 5,
    lowerDifficulty: 800,
    upperDifficulty: 2500,
    timeLimit: 90,
    shuffleOrder: true,
    tags: [],
    contestantType: 'Solo',
    selectedTeam: 'Select Team',
    startsIn: 0,
    startYear: new Date().getFullYear(),
    chooseDifficulty: 'distributeRandomly', // can be 'true', 'false', or 'distributeRandomly'
    diffArr: []
  })
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleTagToggle = tag => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        numQuestions: parseInt(formData.numQuestions),
        lowerDifficulty: parseInt(formData.lowerDifficulty),
        upperDifficulty: parseInt(formData.upperDifficulty),
        timeLimit: parseInt(formData.timeLimit),
        startsIn: parseInt(formData.startsIn),
        startYear: parseInt(formData.startYear),
        diffArr: formData.chooseDifficulty === 'true'
          ? Array.from({ length: formData.numQuestions }, (_, i) =>
              parseInt(prompt(`Enter difficulty for Q${i + 1}`))
            )
          : []
      }

      const res = await createContest(payload)
      if (res.ok && res.id) {
        navigate(`/contest/${res.id}`)
      } else {
        throw new Error(res.message || 'Failed to create contest')
      }
    } catch (err) {
      console.error('Failed to create contest:', err)
      alert('Error creating contest. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-md shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-pink-600">Create Contest</h2>
      {loading ? (
        <Spinner loading={true} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {['codeforcesId1', 'codeforcesId2', 'codeforcesId3'].map((field, i) => (
            <div key={field}>
              <label className="block font-semibold">Codeforces ID {i + 1}</label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Number of Questions</label>
              <input
                type="number"
                name="numQuestions"
                value={formData.numQuestions}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block font-semibold">Time Limit (minutes)</label>
              <input
                type="number"
                name="timeLimit"
                value={formData.timeLimit}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold">Lower Difficulty</label>
              <input
                type="number"
                name="lowerDifficulty"
                value={formData.lowerDifficulty}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block font-semibold">Upper Difficulty</label>
              <input
                type="number"
                name="upperDifficulty"
                value={formData.upperDifficulty}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold">Recency (Start in mins)</label>
            <input
              type="number"
              name="startsIn"
              value={formData.startsIn}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block font-semibold">Difficulty Choice</label>
            <select
              name="chooseDifficulty"
              value={formData.chooseDifficulty}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="false">Range</option>
              <option value="distributeRandomly">Random</option>
              <option value="true">Manual</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">Contestant Type</label>
            <select
              name="contestantType"
              value={formData.contestantType}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            >
              <option value="Solo">Solo</option>
              <option value="Team">Team</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tagList.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2 py-1 rounded text-sm border ${
                    formData.tags.includes(tag)
                      ? 'bg-pink-600 text-white'
                      : 'bg-white text-black'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <input
              type="checkbox"
              name="shuffleOrder"
              checked={formData.shuffleOrder}
              onChange={handleChange}
            />
            <label className="ml-2 font-semibold">Shuffle Questions</label>
          </div>

          <button
            type="submit"
            className="w-full bg-pink-600 text-white py-2 rounded hover:bg-pink-700"
          >
            Create Contest
          </button>
        </form>
      )}
    </div>
  )
}

export default CreateContest
