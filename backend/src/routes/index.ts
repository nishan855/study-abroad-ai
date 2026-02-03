import { Router } from 'express'
import chatRoutes from './chat.routes'
import universityRoutes from './university.routes'
import studentRoutes from './student.routes'
import authRoutes from './auth.routes'
import matchingRoutes from './matching.routes'

const router = Router()

router.use('/chat', chatRoutes)
router.use('/universities', universityRoutes)
router.use('/students', studentRoutes)
router.use('/auth', authRoutes)
router.use('/matching', matchingRoutes)

export default router
