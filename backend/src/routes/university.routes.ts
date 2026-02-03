import { Router } from 'express'

const router = Router()

// Placeholder routes - will be implemented in Phase 2
router.post('/match', (req, res) => {
  res.json({ message: 'Match universities endpoint - to be implemented' })
})

router.get('/search', (req, res) => {
  res.json({ message: 'Search universities endpoint - to be implemented' })
})

router.get('/:id', (req, res) => {
  res.json({ message: 'Get university detail endpoint - to be implemented' })
})

export default router
