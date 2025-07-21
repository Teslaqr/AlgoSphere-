export const createContest = async (data) => {
  const response = await fetch('http://localhost:5000/api/contests', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) throw new Error('Failed to create contest')
  return response.json()
}
