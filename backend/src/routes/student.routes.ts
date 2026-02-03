import { Router } from 'express'

const router = Router()

// Placeholder routes - will be implemented later
router.get('/profile', (req, res) => {
  res.json({ message: 'Get student profile endpoint - to be implemented' })
})

router.put('/profile', (req, res) => {
  res.json({ message: 'Update student profile endpoint - to be implemented' })
})

export default router
